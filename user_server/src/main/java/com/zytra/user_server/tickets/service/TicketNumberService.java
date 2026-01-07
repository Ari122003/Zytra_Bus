package com.zytra.user_server.tickets.service;

import java.security.SecureRandom;

import org.springframework.stereotype.Service;

@Service

public class TicketNumberService {
    private static final String CHAR_LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String CHAR_UPPER = CHAR_LOWER.toUpperCase();
    private static final String NUMBER = "0123456789";
    private static final String SPECIAL_CHARS = "!@#$%^&*()-_=+[]{}|;:,.<>?";

    private static final String DATA_FOR_RANDOM_STRING = CHAR_LOWER + CHAR_UPPER + NUMBER + SPECIAL_CHARS;
    private static SecureRandom random = new SecureRandom();

    public String generateTicketNumber(int length) {
        if (length < 1)
            throw new IllegalArgumentException("Length must be positive.");

        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            // Pick a random index from the pool of characters
            int rndCharAt = random.nextInt(DATA_FOR_RANDOM_STRING.length());
            char rndChar = DATA_FOR_RANDOM_STRING.charAt(rndCharAt);

            sb.append(rndChar);
        }

        return sb.toString();
    }
}
