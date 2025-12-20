package com.zytra.user_server.trips.service.implementation;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zytra.user_server.bus.entity.BusEntity;
import com.zytra.user_server.enums.SeatStatus;
import com.zytra.user_server.enums.TripStatus;
import com.zytra.user_server.routes.entity.RouteEntity;
import com.zytra.user_server.schedule.entity.ScheduleEntity;
import com.zytra.user_server.seat.dto.SeatDTO;
import com.zytra.user_server.seat.entity.SeatEntity;
import com.zytra.user_server.seat.repository.SeatRepository;
import com.zytra.user_server.trips.dto.TripResponse;
import com.zytra.user_server.trips.entity.TripEntity;
import com.zytra.user_server.trips.exception.TripCancelledException;
import com.zytra.user_server.trips.exception.TripNotFoundException;
import com.zytra.user_server.trips.repository.TripRepository;
import com.zytra.user_server.trips.service.TripService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private static final Logger log = LoggerFactory.getLogger(TripServiceImpl.class);
    private static final int TOTAL_ROWS = 12; // Rows A-L
    private static final int SEATS_PER_ROW = 4; // 2x2 layout
    private static final String[] ROW_LABELS = { "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L" };

    private final TripRepository tripRepository;
    private final SeatRepository seatRepository;

    @Override
    @Transactional(readOnly = true)
    public TripResponse getTripDetails(Long tripId) {
        log.debug("Fetching trip details for tripId: {}", tripId);

        TripEntity tripEntity = tripRepository.findByIdWithDetails(tripId)
                .orElseThrow(() -> {
                    log.warn("Trip not found with id: {}", tripId);
                    return new TripNotFoundException("Trip not found with id: " + tripId);
                });

        if (tripEntity.getStatus() == TripStatus.CANCELLED) {
            log.warn("Attempted to access cancelled trip: {}", tripId);
            throw new TripCancelledException("Trip with id " + tripId + " is cancelled");
        }

        ScheduleEntity schedule = tripEntity.getSchedule();
        RouteEntity route = schedule.getRoute();
        BusEntity bus = schedule.getBus();

        // Fetch seats for the trip and build seat matrix
        List<List<SeatDTO>> seatMatrix = buildSeatMatrix(tripId);

        log.debug("Successfully fetched trip details for tripId: {}", tripId);

        return TripResponse.builder()
                .tripId(tripEntity.getId())
                .source(route.getSource())
                .destination(route.getDestination())
                .departureTime(schedule.getDepartureTime())
                .arrivalTime(schedule.getArrivalTime())
                .travelDate(tripEntity.getTravelDate())
                .busNumber(bus.getBusNumber())
                .busType(bus.getDescription())
                .distanceInKm(route.getDistanceKm())
                .availableSeats(tripEntity.getAvailableSeats())
                .fare(tripEntity.getFare())
                .seatMatrix(seatMatrix)
                .totalRows(TOTAL_ROWS)
                .seatsPerRow(SEATS_PER_ROW)
                .build();
    }

    /**
     * Builds a 2D seat matrix from the seats stored in the database.
     * Layout: 12 rows (A-L), 4 seats per row (2x2 configuration).
     * Seat numbers: A1, A2, A3, A4, B1, B2, B3, B4, ..., L1, L2, L3, L4
     */
    private List<List<SeatDTO>> buildSeatMatrix(Long tripId) {
        List<SeatEntity> seats = seatRepository.findByTripIdOrderBySeatNumber(tripId);

        // Create a map for quick lookup of existing seats
        Map<String, SeatEntity> seatMap = seats.stream()
                .collect(Collectors.toMap(SeatEntity::getSeatNumber, seat -> seat));

        List<List<SeatDTO>> matrix = new ArrayList<>();

        for (int row = 0; row < TOTAL_ROWS; row++) {
            List<SeatDTO> rowSeats = new ArrayList<>();
            String rowLabel = ROW_LABELS[row];

            for (int col = 1; col <= SEATS_PER_ROW; col++) {
                String seatNumber = rowLabel + col;
                SeatEntity seatEntity = seatMap.get(seatNumber);

                SeatDTO seatDTO = SeatDTO.builder()
                        .seatNumber(seatNumber)
                        .row(rowLabel)
                        .column(col)
                        .status(seatEntity != null ? seatEntity.getStatus() : SeatStatus.AVAILABLE)
                        .build();

                rowSeats.add(seatDTO);
            }
            matrix.add(rowSeats);
        }

        return matrix;
    }

}
