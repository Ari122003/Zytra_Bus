package com.zytra.user_server.Notification;

import java.util.Map;

public interface EmailService {
    public void sendEmail(String to, String subject, String templateName, Map<String, Object> variables);
}
