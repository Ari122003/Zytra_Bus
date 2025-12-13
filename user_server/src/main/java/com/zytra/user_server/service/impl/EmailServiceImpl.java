package com.zytra.user_server.service.impl;

import com.zytra.user_server.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendEmail(String email, String otp) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("Your OTP Verification Code");
            helper.setText(buildOtpEmailTemplate(otp), true);

            mailSender.send(mimeMessage);
            System.out.println("Email sent successfully to " + email);

        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private String buildOtpEmailTemplate(String otp) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .email-container {
                            max-width: 600px;
                            margin: 40px auto;
                            background-color: #ffffff;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            overflow: hidden;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 24px;
                        }
                        .content {
                            padding: 40px 30px;
                            text-align: center;
                        }
                        .content p {
                            color: #666;
                            font-size: 16px;
                            line-height: 1.6;
                            margin: 0 0 20px 0;
                        }
                        .otp-box {
                            background-color: #f8f9fa;
                            border: 2px dashed #667eea;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 30px 0;
                            display: inline-block;
                        }
                        .otp-code {
                            font-size: 36px;
                            font-weight: bold;
                            color: #667eea;
                            letter-spacing: 8px;
                            margin: 0;
                        }
                        .expiry-text {
                            color: #999;
                            font-size: 14px;
                            margin: 20px 0;
                        }
                        .warning {
                            background-color: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin: 20px 0;
                            text-align: left;
                        }
                        .warning p {
                            margin: 0;
                            color: #856404;
                            font-size: 14px;
                        }
                        .footer {
                            background-color: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            color: #999;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1>🔐 OTP Verification</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>You have requested an OTP for verification. Please use the code below to complete your authentication:</p>

                            <div class="otp-box">
                                <p class="otp-code">"""
                + otp
                + """
                                        </p>
                                    </div>

                                    <p class="expiry-text">⏱️ This code will expire in 5 minutes</p>

                                    <div class="warning">
                                        <p><strong>⚠️ Security Notice:</strong> Never share this code with anyone. Our team will never ask for your OTP.</p>
                                    </div>

                                    <p>If you didn't request this code, please ignore this email or contact our support team.</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Zytra Bus. All rights reserved.</p>
                                    <p>This is an automated message, please do not reply to this email.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """;
    }
}
