package com.zytra.user_server.util;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

public class PasswordUtil {

    private static final String ENV_KEY_NAME = "PASSWORD_ENCRYPTION_KEY";
    private static final String DEFAULT_KEY = "zytra-default-encryption-key";
    private static final String ALGO = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128;
    private static final int IV_LENGTH = 12;
    private static final int SALT_LENGTH = 16;

    private static SecretKeySpec deriveKeySpec(byte[] salt) {
        try {
            String secret = System.getenv(ENV_KEY_NAME);
            if (secret == null || secret.isBlank()) {
                secret = DEFAULT_KEY;
            }
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(secret.getBytes(StandardCharsets.UTF_8));
            md.update(salt);
            byte[] hash = md.digest();
            byte[] keyBytes = new byte[16];
            System.arraycopy(hash, 0, keyBytes, 0, keyBytes.length);
            return new SecretKeySpec(keyBytes, ALGO);
        } catch (Exception e) {
            throw new RuntimeException("Failed to derive encryption key", e);
        }
    }

    public static String encrypt(String plainText) {
        if (plainText == null)
            return null;
        try {
            byte[] salt = new byte[SALT_LENGTH];
            SecureRandom random = new SecureRandom();
            random.nextBytes(salt);

            byte[] iv = new byte[IV_LENGTH];
            random.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            SecretKeySpec keySpec = deriveKeySpec(salt);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, spec);

            byte[] cipherBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            ByteBuffer byteBuffer = ByteBuffer.allocate(salt.length + iv.length + cipherBytes.length);
            byteBuffer.put(salt);
            byteBuffer.put(iv);
            byteBuffer.put(cipherBytes);

            return Base64.getEncoder().encodeToString(byteBuffer.array());
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    public static String decrypt(String base64IvAndCipherText) {
        if (base64IvAndCipherText == null)
            return null;
        try {
            byte[] allBytes = Base64.getDecoder().decode(base64IvAndCipherText);
            ByteBuffer byteBuffer = ByteBuffer.wrap(allBytes);

            byte[] salt = new byte[SALT_LENGTH];
            byteBuffer.get(salt);

            byte[] iv = new byte[IV_LENGTH];
            byteBuffer.get(iv);

            byte[] cipherBytes = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherBytes);

            SecretKeySpec keySpec = deriveKeySpec(salt);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, spec);

            byte[] plainBytes = cipher.doFinal(cipherBytes);
            return new String(plainBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }

}
