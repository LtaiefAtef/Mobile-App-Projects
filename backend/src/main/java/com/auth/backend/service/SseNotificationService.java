package com.auth.backend.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class SseNotificationService {

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    // Queue for pending notifications when user is not yet connected
    private final Map<String, List<Map<String, Object>>> pendingNotifications = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String username) {
        SseEmitter existingEmitter = emitters.get(username);
        if (existingEmitter != null) {
            existingEmitter.complete();
            emitters.remove(username);
        }

        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.put(username, emitter);

        emitter.onCompletion(() -> {
            System.out.println("SSE Completed for: " + username);
            emitters.remove(username);
        });
        emitter.onTimeout(() -> {
            emitter.complete();
            emitters.remove(username);
        });
        emitter.onError(e -> emitters.remove(username));

        // Send connected + any pending notifications in a separate thread
        new Thread(() -> {
            try {
                Thread.sleep(100);
                emitter.send(SseEmitter.event()
                    .name("connected")
                    .data(Map.of("message", "Subscribed successfully", "username", username)));

                // Flush any notifications that arrived before SSE was ready
                List<Map<String, Object>> pending = pendingNotifications.remove(username);
                if (pending != null) {
                    for (Map<String, Object> notification : pending) {
                        emitter.send(SseEmitter.event()
                            .name("notification")
                            .data(notification));
                    }
                }
            } catch (IOException | InterruptedException e) {
                emitters.remove(username);
            }
        }).start();

        return emitter;
    }

    public boolean sendToUser(String username, String title, String message) {
        SseEmitter emitter = emitters.get(username);

        Map<String, Object> payload = Map.of(
            "title", title,
            "message", message,
            "timestamp", System.currentTimeMillis()
        );

        // User not connected yet — queue it
        if (emitter == null) {
            System.out.println("User offline, queuing notification for: " + username);
            pendingNotifications
                .computeIfAbsent(username, k -> new java.util.ArrayList<>())
                .add(payload);
            return false;
        }

        try {
            emitter.send(SseEmitter.event()
                .name("notification")
                .data(payload));
            System.out.println("Notification sent to: " + username);
            return true;
        } catch (IOException e) {
            System.out.println("Error sending notification: " + e.getMessage());
            emitters.remove(username);
            // Queue it for when they reconnect
            pendingNotifications
                .computeIfAbsent(username, k -> new java.util.ArrayList<>())
                .add(payload);
            return false;
        }
    }

    public boolean isUserOnline(String username) {
        return emitters.containsKey(username);
    }
}