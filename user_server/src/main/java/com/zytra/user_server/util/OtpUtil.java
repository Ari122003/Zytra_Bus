package com.zytra.user_server.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class OtpUtil {
    public static String generateOtp() {
        int otp = (int) (Math.random() * 900000) + 100000;
        return String.valueOf(otp);
    }

    public static String hashOtp(String otp) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hashed = md.digest(otp.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hashed)
                sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing OTP", e);
        }
    }

    public static boolean verifyOtp(String plainOtp, String hashedOtp) {
        String hashedInput = hashOtp(plainOtp);
        return hashedInput.equals(hashedOtp);
    }

}
