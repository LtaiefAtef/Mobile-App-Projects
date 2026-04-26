package com.auth.backend.controller;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.auth.backend.service.SseNotificationService;

@RestController
@RequestMapping("/notifications")
public class SseNotificationController {

    private final SseNotificationService notificationService;

    public SseNotificationController(SseNotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Mobile app calls this once on startup to start receiving notifications
    @GetMapping(value = "/subscribe/{username}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@PathVariable String username) {
        System.out.println("SSE NOTIFICATION CONTROLLER SUBSCRIBE");
        return notificationService.subscribe(username);
    }

    // Optional: check if a user is currently connected
    @GetMapping("/online/{username}")
    public ResponseEntity<Map<String, Boolean>> isOnline(@PathVariable String username) {
        return ResponseEntity.ok(Map.of("online", notificationService.isUserOnline(username)));
    }
}