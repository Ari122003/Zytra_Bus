package com.zytra.user_server.Notification;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.zytra.user_server.bookings.entity.BookingEntity;
import com.zytra.user_server.bookings.repository.BookingRepository;
import com.zytra.user_server.bookings.repository.BookingSeatRepository;
import com.zytra.user_server.enums.BookingStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class TripReminderScheduler {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final NotificationManager notificationManager;

    /**
     * Runs every 10 minutes to check for trips starting in approximately 1 hour.
     * Sends reminder notifications to all users with confirmed bookings for those
     * trips.
     * Handles edge case where notification time crosses midnight (e.g., 11 PM for a
     * 12 AM trip).
     */
    @Scheduled(fixedRate = 600000) // 10 minutes = 600,000 milliseconds
    @Transactional(readOnly = true)
    public void checkUpcomingTrips() {
        try {
            log.info("Running trip reminder scheduler...");

            LocalDate today = LocalDate.now();
            LocalTime currentTime = LocalTime.now();

            // Define time window: 50 minutes to 70 minutes from now
            LocalTime startWindow = currentTime.plusMinutes(50);
            LocalTime endWindow = currentTime.plusMinutes(70);

            List<BookingEntity> upcomingBookings = new ArrayList<>();

            // Check if the time window crosses midnight
            if (endWindow.isBefore(startWindow)) {
                // Case 1: Time window crosses midnight (e.g., 11:10 PM to 12:10 AM)
                log.debug(
                        "Time window crosses midnight. Checking trips on {} from {} to 23:59:59 and on {} from 00:00:00 to {}",
                        today, startWindow, today.plusDays(1), endWindow);

                // Get trips today from startWindow to end of day
                List<BookingEntity> todayBookings = bookingRepository
                        .findByTravelDateAndDepartureTimeBetweenAndStatus(
                                today, startWindow, LocalTime.of(23, 59, 59), BookingStatus.CONFIRMED);
                upcomingBookings.addAll(todayBookings);

                // Get trips tomorrow from start of day to endWindow
                List<BookingEntity> tomorrowBookings = bookingRepository
                        .findByTravelDateAndDepartureTimeBetweenAndStatus(
                                today.plusDays(1), LocalTime.of(0, 0, 0), endWindow, BookingStatus.CONFIRMED);
                upcomingBookings.addAll(tomorrowBookings);

            } else {
                // Case 2: Normal case - time window is within the same day
                log.debug("Checking for trips on {} departing between {} and {}", today, startWindow, endWindow);

                upcomingBookings = bookingRepository
                        .findByTravelDateAndDepartureTimeBetweenAndStatus(
                                today, startWindow, endWindow, BookingStatus.CONFIRMED);
            }

            if (upcomingBookings.isEmpty()) {
                log.debug("No upcoming trips found in the next hour");
                return;
            }

            log.info("Found {} bookings for trips starting in ~1 hour", upcomingBookings.size());

            // Send notification for each booking
            for (BookingEntity booking : upcomingBookings) {
                try {
                    sendTripReminderNotification(booking);
                } catch (Exception e) {
                    log.error("Failed to send reminder for booking ID: {}", booking.getId(), e);
                }
            }

            log.info("Trip reminder notifications sent successfully");

        } catch (Exception e) {
            log.error("Error in trip reminder scheduler", e);
        }
    }

    /**
     * Sends trip reminder notification to a user.
     * 
     * @param booking the booking entity containing trip and user details
     */
    private void sendTripReminderNotification(BookingEntity booking) {
        List<String> seatNumbers = bookingSeatRepository.findSeatNumbersByBookingId(booking.getId());

        EventData eventData = EventData.builder()
                .eventType(EventType.TRIP_STARTING_SOON)
                .email(booking.getUser().getEmail())
                .userName(booking.getUser().getName())
                .start(booking.getTrip().getSchedule().getRoute().getSource())
                .end(booking.getTrip().getSchedule().getRoute().getDestination())
                .date(booking.getTrip().getTravelDate().toString())
                .departureTime(booking.getTrip().getSchedule().getDepartureTime().toString())
                .seatNumber(seatNumbers)
                .build();

        notificationManager.notifyObservers(eventData);

        log.debug("Sent trip reminder to {} for trip from {} to {} at {}",
                booking.getUser().getEmail(),
                booking.getTrip().getSchedule().getRoute().getSource(),
                booking.getTrip().getSchedule().getRoute().getDestination(),
                booking.getTrip().getSchedule().getDepartureTime());
    }
}
