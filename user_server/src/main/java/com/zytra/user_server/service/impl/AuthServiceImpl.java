package com.zytra.user_server.service.impl;

import org.springframework.stereotype.Service;

import com.zytra.user_server.dto.request.LoginRequest;
import com.zytra.user_server.dto.response.OtpSentResponse;
import com.zytra.user_server.entity.OtpEntity;
import com.zytra.user_server.repository.OtpRepository;
import com.zytra.user_server.service.AuthService;
import com.zytra.user_server.service.SmsService;
import com.zytra.user_server.util.OtpUtil;

@Service
public class AuthServiceImpl implements AuthService {
    private final OtpRepository otpRepository;
    private final SmsService smsService;

    public AuthServiceImpl(OtpRepository otpRepository, SmsService smsService) {
        this.otpRepository = otpRepository;
        this.smsService = smsService;
    }

    @Override
    public OtpSentResponse sendOtp(LoginRequest request) {
        String otp = OtpUtil.generateOtp();
        String hashedOtp = OtpUtil.hashOtp(otp);

        OtpEntity otpEntity = new OtpEntity();
        otpEntity.setPhone(request.getPhone());
        otpEntity.setOtpHash(hashedOtp);
        otpRepository.save(otpEntity);

        smsService.sendSms(request.getPhone(), "Your OTP is: " + otp);

        return new OtpSentResponse("OTP sent successfully");
    }

}
