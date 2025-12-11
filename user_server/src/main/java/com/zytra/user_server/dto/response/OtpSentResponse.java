package com.zytra.user_server.dto.response;

public class OtpSentResponse {
    private String message;

    public OtpSentResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
