package com.zytra.user_server.Notification;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationObserver implements NotificationObserver {

    private final EmailService emailService;

    @Override
    public void notify(EventData eventData) {
        try {
            switch (eventData.getEventType()) {
                case REGISTRATION_COMPLETED:
                    emailService.sendEmail(
                            eventData.getEmail(),
                            "Welcome to Zytra Bus Service",
                            "emails/registration_completed",
                            Map.of("userName", eventData.getUserName()));
                    break;

                case BOOKING_CONFIRMED:
                    emailService.sendEmail(
                            eventData.getEmail(),
                            "Booking Confirmed - Zytra Bus Service",
                            "emails/booking_confirmed",
                            Map.of(
                                    "userName", eventData.getUserName() != null ? eventData.getUserName() : "",
                                    "start", eventData.getStart() != null ? eventData.getStart() : "",
                                    "end", eventData.getEnd() != null ? eventData.getEnd() : "",
                                    "date", eventData.getDate() != null ? eventData.getDate() : "",
                                    "departureTime",
                                    eventData.getDepartureTime() != null ? eventData.getDepartureTime() : "",
                                    "seatNumber",
                                    eventData.getSeatNumber() != null ? eventData.getSeatNumber() : List.of()));
                    break;

                case TRIP_STARTING_SOON:
                    emailService.sendEmail(
                            eventData.getEmail(),
                            "Your Trip is Starting Soon - Zytra Bus Service",
                            "emails/trip_starting_soon",
                            Map.of(
                                    "userName", eventData.getUserName(),
                                    "start", eventData.getStart(),
                                    "end", eventData.getEnd(),
                                    "date", eventData.getDate(),
                                    "departureTime", eventData.getDepartureTime()));
                    break;

                default:
                    log.warn("Unknown event type: {}", eventData.getEventType());
            }
        } catch (Exception e) {
            log.error("Failed to send notification email for event: {}", eventData.getEventType(), e);
        }
    }

}
