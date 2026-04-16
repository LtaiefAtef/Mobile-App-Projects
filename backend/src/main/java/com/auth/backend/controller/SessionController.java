package com.auth.backend.controller;

import com.auth.backend.dto.Session;
import com.auth.backend.dto.SessionMessage;
import com.auth.backend.dto.SessionRequests.*;
import com.auth.backend.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
    private final SimpMessagingTemplate messagingTemplate;

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void broadcast(String code, SessionMessage.Type type, String sender, String payload) {
        SessionMessage msg = new SessionMessage();
        msg.setType(type);
        msg.setSender(sender);
        msg.setSessionCode(code);
        msg.setPayload(payload);
        msg.setTimestamp(System.currentTimeMillis());
        messagingTemplate.convertAndSend("/topic/session/" + code, msg);
    }

    // ── REST ──────────────────────────────────────────────────────────────────

    /** POST /sessions/create  →  { username } */
    @PostMapping("/create")
    public ResponseEntity<Session> createSession(@RequestBody CreateSessionRequest request) {
        System.out.println("Creating session for user: " + request.getUsername());
        Session session = sessionService.createSession(request);
        broadcast(session.getCode(), SessionMessage.Type.SYSTEM, request.getUsername(), "Session created");
        return ResponseEntity.ok(session);
    }

    /** POST /sessions/join  →  { code, username } */
    @PostMapping("/join")
    public ResponseEntity<Session> joinSession(@RequestBody JoinSessionRequest request) {
        System.out.println("User " + request.getUsername() + " joining session: " + request.getCode());
        Session session = sessionService.joinSession(request);
        return ResponseEntity.ok(session);
    }

    /** POST /sessions/update  →  { code, username, sharedData } */
    @PostMapping("/update")
    public ResponseEntity<Session> updateSharedData(@RequestBody UpdateDataRequest request) {
        System.out.println("Pushing update for user " + request.getUsername() + ": " + request.getSharedData());
        Session session = sessionService.updateSharedData(request);
        broadcast(session.getCode(), SessionMessage.Type.DATA_UPDATE, request.getUsername(), request.getSharedData());
        return ResponseEntity.ok(session);
    }
    
    /** DELETE /sessions/{code}/leave?username=alice */
    @DeleteMapping("/{code}/leave")
    public ResponseEntity<Void> leaveSession(@PathVariable String code, @RequestParam String username) {
        System.out.println("Leaving Session: " + username);
        sessionService.leaveSession(code, username);
        broadcast(code, SessionMessage.Type.USER_LEFT, username, username + " left");
        return ResponseEntity.noContent().build();
    }

    /** GET /sessions/{code} */
    @GetMapping("/{code}")
    public ResponseEntity<Session> getSession(@PathVariable String code) {
        return ResponseEntity.ok(sessionService.getSession(code));
    }

    // ── WebSocket ─────────────────────────────────────────────────────────────

    /** Clients send to /app/session.send → relayed to /topic/session/{code} */
    @MessageMapping("/session.send")
    public void relayMessage(@Payload SessionMessage message) {
        message.setTimestamp(System.currentTimeMillis());
        messagingTemplate.convertAndSend(
                "/topic/session/" + message.getSessionCode(),
                message
        );
    }
}