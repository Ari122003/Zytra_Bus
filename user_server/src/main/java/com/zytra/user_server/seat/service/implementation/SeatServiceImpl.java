package com.zytra.user_server.seat.service.implementation;

import com.zytra.user_server.seat.exception.InvalidSeatException;
import com.zytra.user_server.seat.exception.LockOwnerRequiredException;
import com.zytra.user_server.seat.exception.NoSeatsSpecifiedException;
import com.zytra.user_server.seat.exception.SeatAlreadyLockedException;
import com.zytra.user_server.seat.exception.SeatNotAvailableException;
import com.zytra.user_server.seat.service.SeatService;
import com.zytra.user_server.user.entity.UserEntity;
import com.zytra.user_server.user.exception.UserNotFoundException;
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

    private final UserRepository userRepository;
    private final SeatRepository seatRepository;

    private static final int LOCK_DURATION_MINUTES = 10;

    /**
     * Locks the specified seats for a trip on behalf of a user.
     * Validates seat availability, removes expired locks, ensures seats are not
     * already locked by others,
     * unlocks previously locked seats that are not in the current selection, and
     * locks the selected seats.
     * 
     * @param tripId    the ID of the trip
     * @param seats     array of seat numbers to lock
     * @param lockOwner the ID of the user requesting the lock
     * @return LockSeatsResponse containing locked seat numbers and lock expiration
     *         time
     * @throws LockOwnerRequiredException if lockOwner is null
     * @throws UserNotFoundException      if user with lockOwner ID is not found
     * @throws NoSeatsSpecifiedException  if seats array is null or empty
     * @throws InvalidSeatException       if one or more selected seats are invalid
     * @throws SeatAlreadyLockedException if a seat is already locked by another
     *                                    user
     * @throws SeatNotAvailableException  if a seat is already booked
     */
    @Override
    @Transactional
    public LockSeatsResponse lockSeats(long tripId, String[] seats, Long lockOwner) {

        if (lockOwner == null) {
            throw new LockOwnerRequiredException("Lock owner id is required");
        }

        UserEntity user = userRepository.findById(lockOwner)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + lockOwner));

        if (seats == null || seats.length == 0) {
            throw new NoSeatsSpecifiedException("No seats specified to lock");
        }

        List<String> seatList = Arrays.asList(seats);
        List<SeatEntity> currentLocks = seatRepository.findByTripIdAndSeatNumberIn(tripId, seatList);

        if (currentLocks.size() != seatList.size()) {
            throw new InvalidSeatException("One or more selected seats are invalid");
        }

        List<SeatEntity> allLocksByUser = seatRepository.findByTripIdAndLockOwnerId(tripId, lockOwner);

        HashSet<SeatEntity> lockSet = new HashSet<>(currentLocks);

        lockSet.addAll(allLocksByUser);

        List<SeatEntity> existingSeats = new ArrayList<>(lockSet);

        LocalDateTime now = LocalDateTime.now();

        for (SeatEntity seat : existingSeats) {

            if (seat.getLockedUntil() != null && seat.getLockedUntil().isBefore(now)) {

                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setLockedUntil(null);
                seat.setLockOwner(null);
            }

            if (seat.getLockedUntil() != null && seat.getLockedUntil().isAfter(now) &&
                    !seat.getLockOwner().getId().equals(lockOwner)) {

                throw new SeatAlreadyLockedException(
                        "Seat " + seat.getSeatNumber() + " is already locked by another user");
            }

            if (seat.getStatus() == SeatStatus.BOOKED) {
                throw new SeatNotAvailableException("Seat " + seat.getSeatNumber() + " is already booked");
            }

            if (seat.getLockedUntil() != null && seat.getLockedUntil().isAfter(now) &&
                    seat.getLockOwner().getId().equals(lockOwner) &&
                    !currentLocks.contains(seat)) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setLockedUntil(null);
                seat.setLockOwner(null);

                continue;
            }

            seat.setLockOwner(user);
            seat.setLockedUntil(now.plusMinutes(LOCK_DURATION_MINUTES));
        }

        seatRepository.saveAll(existingSeats);

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