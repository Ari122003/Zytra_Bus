package com.zytra.user_server.service.impl;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import com.zytra.user_server.service.SmsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class SmsServiceImpl implements SmsService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String fromPhoneNumber;

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
    }

    @Override
    public void sendSms(String phone, String message) {
        try {
            Message.creator(
                    new PhoneNumber(phone),
                    new PhoneNumber(fromPhoneNumber),
                    message).create();

            System.out.println("SMS sent successfully to " + phone);
        } catch (Exception e) {
            System.err.println("Failed to send SMS: " + e.getMessage());
            throw new RuntimeException("Failed to send SMS", e);
        }
    }
}
