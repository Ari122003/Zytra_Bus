package com.zytra.user_server.tickets.service;

import org.springframework.stereotype.Service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import java.awt.image.BufferedImage;

@Service
public class QRCodeService {
    /**
     * Generates a QR code image from the provided text.
     * Creates a 250x250 pixel QR code image in BufferedImage format.
     * 
     * @param text the text to encode in the QR code
     * @return BufferedImage containing the QR code
     * @throws Exception if QR code generation fails
     */
    public BufferedImage generateQRCode(String text) throws Exception {
        QRCodeWriter barcodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = barcodeWriter.encode(text, BarcodeFormat.QR_CODE, 250, 250);
        return MatrixToImageWriter.toBufferedImage(bitMatrix);
    }
}
