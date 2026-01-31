package com.zytra.user_server.Notification;

public interface EventPublisher {
    void registerObserver(NotificationObserver observer);

    void removeObserver(NotificationObserver observer);

    void notifyObservers(EventData data);
}
