package com.zytra.user_server.seat.service.implementation;

import com.zytra.user_server.seat.service.SeatService;
import com.zytra.user_server.trips.entity.TripEntity;
import com.zytra.user_server.trips.repository.TripRepository;
import com.zytra.user_server.user.entity.UserEntity;
import com.zytra.user_server.user.repository.UserRepository;

import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

import org.springframework.stereotype.Service;

import com.zytra.user_server.enums.SeatStatus;
import com.zytra.user_server.seat.dto.LockSeatsResponse;
import com.zytra.user_server.seat.entity.SeatEntity;
import com.zytra.user_server.seat.repository.SeatRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SeatServiceImpl implements SeatService {

    private static final int LOCK_DURATION_MINUTES = 10;

    private final SeatRepository seatRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public LockSeatsResponse lockSeats(long tripId, String[] seats, Long lockOwner) {

        TripEntity tripEntity = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + tripId));

        // resolve lockOwner id -> UserEntity
        if (lockOwner == null) {
            throw new RuntimeException("lockOwner id is required");
        }

        UserEntity user = userRepository.findById(lockOwner)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + lockOwner));

        if (seats == null || seats.length == 0) {
            throw new RuntimeException("No seats specified to lock");
        }

        List<String> seatList = Arrays.asList(seats);
        List<SeatEntity> currentLocks = seatRepository.findByTripIdAndSeatNumberIn(tripId, seatList);
        List<SeatEntity> allLocksByUser = seatRepository.findByTripIdAndLockOwnerId(tripId, lockOwner);

        HashSet<SeatEntity> lockSet = new HashSet<>(currentLocks);

        lockSet.addAll(allLocksByUser);

        List<SeatEntity> existingSeats = new ArrayList<>(lockSet);

        LocalDateTime now = LocalDateTime.now();

        for (SeatEntity seat : existingSeats) {

            // Removing expired locks before attempting to lock
            if (seat.getLockedUntil() != null && seat.getLockedUntil().isBefore(now)) {

                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setLockedUntil(null);
                seat.setLockOwner(null);
            }

            // Already locked by someone else
            if (seat.getLockedUntil() != null && seat.getLockedUntil().isAfter(now) &&
                    !seat.getLockOwner().getId().equals(lockOwner)) {

                throw new RuntimeException("Seat already locked");
            }

            // Booked seat
            if (seat.getStatus() == SeatStatus.BOOKED) {
                throw new RuntimeException("Seat already booked");
            }

            // if seat is locked by the same user and lock not expired and seat is not in
            // current locks then unlock it
            if (seat.getLockedUntil() != null && seat.getLockedUntil().isAfter(now) &&
                    seat.getLockOwner().getId().equals(lockOwner) &&
                    !currentLocks.contains(seat)) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setLockedUntil(null);
                seat.setLockOwner(null);

                continue;
            }

            // Lock seat
            seat.setLockOwner(user);
            seat.setLockedUntil(now.plusMinutes(LOCK_DURATION_MINUTES));
        }

        seatRepository.saveAll(existingSeats);

        // Prepare response

        String[] lockedSeatNumbers = existingSeats.stream()
                .map(SeatEntity::getSeatNumber)
                .toArray(String[]::new);

        LockSeatsResponse response = LockSeatsResponse.builder()
                .message("Seats locked successfully")
                .lockedSeats(lockedSeatNumbers)
                .lockExpiresAt(now.plusMinutes(LOCK_DURATION_MINUTES)).build();

        return response;

    }

}