package com.auth.backend.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.stereotype.Component;

@Component
public class StompChannelInterceptor implements ChannelInterceptor {

    // No constructor injection — use the static method just like AdminAuthService does
    private final JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) return message;

        System.out.println("📨 STOMP command: " + accessor.getCommand());

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {

            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("❌ Missing Authorization header");
                throw new IllegalArgumentException("Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7);

            try {
                // ✅ Same pattern as AdminAuthService.hasAdminRole()
                Jwt jwt = JwtDecoderProvider.create().decode(token);
                Authentication authentication = jwtAuthenticationConverter.convert(jwt);
                accessor.setUser(authentication);
                System.out.println("✅ STOMP auth OK — user: " + jwt.getSubject());
            } catch (Exception e) {
                System.out.println("❌ JWT validation failed: " + e.getMessage());
                throw new IllegalArgumentException("Invalid JWT: " + e.getMessage());
            }
        }

        return message;
    }
}