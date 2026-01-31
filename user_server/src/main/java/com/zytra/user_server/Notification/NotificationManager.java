package com.zytra.user_server.Notification;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificationManager implements EventPublisher {
    private final List<NotificationObserver> observers = new ArrayList<>();
    private ExecutorService executor;

    private final EmailNotificationObserver emailNotificationObserver;

    @PostConstruct
    public void init() {
        executor = Executors.newFixedThreadPool(5);
        registerObserver(emailNotificationObserver);
    }

    @PreDestroy
    public void cleanup() {
        if (executor != null && !executor.isShutdown()) {
            executor.shutdown();
        }
    }

    @Override
    public void registerObserver(NotificationObserver observer) {
        observers.add(observer);
    }

    @Override
    public void removeObserver(NotificationObserver observer) {
        observers.remove(observer);
    }

    @Override
    public void notifyObservers(EventData data) {
        for (NotificationObserver observer : observers) {
            executor.submit(() -> observer.notify(data));
        }
    }
}
