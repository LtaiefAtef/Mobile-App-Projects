package com.auth.backend.service;

import com.auth.backend.dto.Session;
import com.auth.backend.dto.Session.SessionStatus;
import com.auth.backend.dto.SessionMessage;
import com.auth.backend.dto.SessionRequests.*;
import com.auth.backend.logs.BackendLogger;
import com.auth.backend.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ─── Create ──────────────────────────────────────────────────────────────

    public Session createSession(CreateSessionRequest request) {
        String code = generateUniqueCode();

        Session session = Session.builder()
                .code(code)
                .createdBy(request.getUsername())
                .status(SessionStatus.WAITING)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        session.getParticipants().add(request.getUsername());

        return sessionRepository.save(session);
    }

    // ─── Join ─────────────────────────────────────────────────────────────────

    public Session joinSession(JoinSessionRequest request) {
        try{
            Session session = sessionRepository.findByCode(request.getCode())
            .orElseThrow(() -> new IllegalArgumentException("Session not found: " + request.getCode()));

            if (session.getStatus() == SessionStatus.CLOSED) {
                throw new IllegalStateException("Session is already closed.");
            }
            if (session.getParticipants().size() > 2) {
                throw new IllegalStateException("Session is full.");
            }
            if (session.getParticipants().contains(request.getUsername())) {
                // Already in — just return current state (reconnect)
                return session;
            }

            session.getParticipants().add(request.getUsername());
            session.setStatus(SessionStatus.ACTIVE);
            session.setUpdatedAt(Instant.now());
            Session saved = sessionRepository.save(session);

            // Notify all subscribers on this session topic
            broadcast(saved.getCode(), SessionMessage.builder()
            .type(SessionMessage.Type.USER_JOINED)
            .sender(request.getUsername())
            .sessionCode(saved.getCode())
            .payload(request.getUsername() + " joined the session")
            .timestamp(System.currentTimeMillis())
            .build());
            
            return saved;
        }catch (Exception e){
            BackendLogger.logError("Error Joining the session", "backend\\src\\main\\java\\com\\auth\\backend\\service\\SessionService.java", e);
            return null;
        }
    }

    // ─── Update shared data ───────────────────────────────────────────────────

    public Session updateSharedData(UpdateDataRequest request) {
        try{
            
            Session session = sessionRepository.findByCode(request.getCode())
            .orElseThrow(() -> new IllegalArgumentException("Session not found: " + request.getCode()));

            if (session.getStatus() != SessionStatus.ACTIVE) {
                throw new IllegalStateException("Session is not active.");
            }

            session.setSharedData(request.getSharedData());
            session.setUpdatedAt(Instant.now());
            Session saved = sessionRepository.save(session);
            return saved;

        }catch(Exception e){
            BackendLogger.logError("Error updating Session", "backend\\src\\main\\java\\com\\auth\\backend\\service\\SessionService.java", e);
            return null;
        }
    }

    // ─── Leave ────────────────────────────────────────────────────────────────

    public void leaveSession(String code, String username) {
        Session session = sessionRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + code));

        session.getParticipants().remove(username);
        session.setStatus(SessionStatus.CLOSED);
        session.setUpdatedAt(Instant.now());
        sessionRepository.save(session);

        broadcast(code, SessionMessage.builder()
                .type(SessionMessage.Type.SESSION_CLOSED)
                .sender(username)
                .sessionCode(code)
                .payload(username + " left the session")
                .timestamp(System.currentTimeMillis())
                .build());
    }

    // ─── Get session ──────────────────────────────────────────────────────────
    public Session getSession(String code) {
        return sessionRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + code));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private void broadcast(String sessionCode, SessionMessage message) {
        messagingTemplate.convertAndSend("/topic/session/" + sessionCode, message);
    }

    private String generateUniqueCode() {
        String code;
        do {
            // Format: XXX-YYY  (uppercase alphanumeric, easy to read/share)
            String raw = UUID.randomUUID().toString().replace("-", "").toUpperCase().substring(0, 6);
            code = raw.substring(0, 3) + "-" + raw.substring(3);
        } while (sessionRepository.existsByCode(code));
        return code;
    }
}
