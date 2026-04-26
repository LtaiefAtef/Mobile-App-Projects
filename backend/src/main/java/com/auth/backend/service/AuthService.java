package com.auth.backend.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.auth.backend.dto.LoginRequest;
import com.auth.backend.dto.NotificationRequest;
import com.auth.backend.dto.TokenResponse;
import com.auth.backend.dto.SignupRequest;
import com.auth.backend.dto.User;
import com.auth.backend.dto.User.Notification;
import com.auth.backend.logs.BackendLogger;
import com.auth.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RestTemplate rest = new RestTemplate();

    // ─── Constants ────────────────────────────────────────────────────────────────
    private final String KEYCLOAK_TOKEN_URL    = "http://localhost:8080/realms/mobile-realm/protocol/openid-connect/token";
    private final String ADMIN_TOKEN_URL       = "http://localhost:8080/realms/master/protocol/openid-connect/token";
    private final String KEYCLOAK_USERS_URL    = "http://localhost:8080/admin/realms/mobile-realm/users";
    private final String CLIENT_ID             = "mobile-client";
    private final String ADMIN_CLIENT_ID       = "admin-cli";
    private final String ADMIN_USERNAME        = "admin";
    private final String ADMIN_PASSWORD        = "admin";
    private final SseNotificationService notificationService;
    // ─── Keycloak Helpers ─────────────────────────────────────────────────────────

    private String getAdminToken() {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "password");
        body.add("client_id", ADMIN_CLIENT_ID);
        body.add("username", ADMIN_USERNAME);
        body.add("password", ADMIN_PASSWORD);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);
        Map<String, Object> tokenRes = rest.postForObject(ADMIN_TOKEN_URL, entity, Map.class);
        return (String) tokenRes.get("access_token");
    }

    private String getKeycloakUserId(String accessToken, String username) {
        String searchUrl = KEYCLOAK_USERS_URL + "?username=" + username + "&exact=true";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<List<Map<String, Object>>> response = rest.exchange(
            searchUrl, HttpMethod.GET, entity,
            new ParameterizedTypeReference<List<Map<String, Object>>>() {}
        );
        List<Map<String, Object>> users = response.getBody();
        if (users == null || users.isEmpty())
            throw new RuntimeException("User not found in Keycloak: " + username);
        return (String) users.get(0).get("id");
    }

    private void patchKeycloakUser(String accessToken, String keycloakUserId, Map<String, Object> payload) {
        String updateUrl = KEYCLOAK_USERS_URL + "/" + keycloakUserId;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        rest.exchange(updateUrl, HttpMethod.PUT, entity, Void.class);
    }

    // ─── Auth ─────────────────────────────────────────────────────────────────────
    public ResponseEntity<?> login(LoginRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "password");
            body.add("client_id", CLIENT_ID);
            body.add("username", request.getUsername());
            body.add("password", request.getPassword());

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<TokenResponse> response = rest.exchange(
                KEYCLOAK_TOKEN_URL,
                HttpMethod.POST,
                entity,
                TokenResponse.class
            );

            return ResponseEntity.ok(response.getBody());

        }catch (HttpClientErrorException e) {
            String message = "Invalid username or password";
            String raw = e.getResponseBodyAsString();
            System.out.println("KEYCLOAK LOGGED ERROR: " + raw);
            if (raw.contains("user_not_found")) {
                message = "User does not exist";
            } else if (raw.contains("invalid_grant")) {
                message = "Wrong password";
            }
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(message);
        }
    }
    public TokenResponse refreshToken(String refreshToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "refresh_token");
            body.add("client_id", CLIENT_ID);
            body.add("refresh_token", refreshToken);
            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);
            return rest.postForObject(KEYCLOAK_TOKEN_URL, entity, TokenResponse.class);
        } catch (Exception e) {
            BackendLogger.logError("Refresh Error", "AuthService.java", e);
            return null;
        }
    }

    // ─── User Lifecycle ───────────────────────────────────────────────────────────

    public boolean signup(SignupRequest request) {
        try {
            String token = getAdminToken();

            // ── Keycloak: Create User ──
            HttpHeaders createHeaders = new HttpHeaders();
            createHeaders.setContentType(MediaType.APPLICATION_JSON);
            createHeaders.setBearerAuth(token);

            Map<String, String> creds = new HashMap<>();
            creds.put("type", "password");
            creds.put("value", request.getPassword());
            creds.put("temporary", "false");

            Map<String, List<String>> attributes = new HashMap<>();
            attributes.put("phoneNumber", Arrays.asList(request.getPhoneNumber()));

            Map<String, Object> user = new HashMap<>();
            user.put("username", request.getUsername());
            user.put("email", request.getEmail());
            user.put("firstName", request.getPrename());
            user.put("lastName", request.getFamilyName());
            user.put("enabled", true);
            user.put("credentials", Arrays.asList(creds));
            user.put("emailVerified", false);
            user.put("requiredActions", Arrays.asList("VERIFY_EMAIL"));
            user.put("attributes", attributes);

            HttpEntity<Map<String, Object>> createEntity = new HttpEntity<>(user, createHeaders);
            rest.postForObject(KEYCLOAK_USERS_URL, createEntity, String.class);

            // ── MongoDB: Save User ──
            try {
                User mongoUser = new User();
                mongoUser.setUsername(request.getUsername());
                mongoUser.setFirstName(request.getPrename());
                mongoUser.setLastName(request.getFamilyName());
                mongoUser.setEmail(request.getEmail());
                mongoUser.setPhone(request.getPhoneNumber());
                mongoUser.setPassword(request.getPassword());
                User saved = userRepository.save(mongoUser);
                System.out.println("MongoDB saved with id: " + saved.getId());
            } catch (Exception mongoEx) {
                System.out.println("MongoDB save FAILED: " + mongoEx.getMessage());
                mongoEx.printStackTrace();
            }

            System.out.println("User " + request.getUsername() + " created in Keycloak and MongoDB");
            resendVerification(request.getUsername());
            return true;
        } catch (Exception e) {
            BackendLogger.logError("Sign Up Error", "AuthService.java", e);
            return false;
        }
    }

    public boolean deleteUser(String username) {
        try {
            String token = getAdminToken();
            String keycloakId = getKeycloakUserId(token, username);

            // ── Keycloak: Delete User ──
            String deleteUrl = KEYCLOAK_USERS_URL + "/" + keycloakId;
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            rest.exchange(deleteUrl, HttpMethod.DELETE, new HttpEntity<>(headers), Void.class);
            System.out.println("User " + username + " deleted from Keycloak");

            // ── MongoDB: Delete User ──
            try {
                userRepository.deleteByUsername(username);
                System.out.println("User " + username + " deleted from MongoDB");
            } catch (Exception mongoEx) {
                System.out.println("MongoDB delete FAILED: " + mongoEx.getMessage());
                mongoEx.printStackTrace();
            }
            return true;
        } catch (Exception e) {
            BackendLogger.logError("Delete User Error", "AuthService.java", e);
            return false;
        }
    }

    // ─── Email Verification ───────────────────────────────────────────────────────

    public void resendVerification(String username) {
        try {
            String token = getAdminToken();
            String keycloakId = getKeycloakUserId(token, username);

            String verifyUrl = KEYCLOAK_USERS_URL + "/" + keycloakId + "/send-verify-email";
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            rest.exchange(verifyUrl, HttpMethod.PUT, new HttpEntity<>(headers), Void.class);
            System.out.println("Verification email sent to: " + username);
        } catch (Exception e) {
            BackendLogger.logError("Resend Verification Error", "AuthService.java", e);
        }
    }

    public boolean isEmailVerified(String username) {
        try {
            String token = getAdminToken();
            String keycloakId = getKeycloakUserId(token, username);

            String userUrl = KEYCLOAK_USERS_URL + "/" + keycloakId;
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            ResponseEntity<Map<String, Object>> response = rest.exchange(
                userUrl, HttpMethod.GET, new HttpEntity<>(headers),
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> user = response.getBody();
            System.out.println("User found: " + user);
            if(Boolean.TRUE.equals(user.get("emailVerified"))){
                System.out.println("Email verified");
                notificationService.sendToUser(
                    username,
                    "Email Verified",
                    "Your email address has been successfully verified."
                );
                return true;
            }
            return false;
        } catch (Exception e) {
            BackendLogger.logError("Email Verification Check Error", "AuthService.java", e);
            return false;
        }
    }

    // ─── User Profile Updates ─────────────────────────────────────────────────────

    public User setUserFullName(User user) {
        try {
            // ── MongoDB ──
            User existingUser = userRepository.findByUsername(user.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
            existingUser.setFirstName(user.getFirstName());
            existingUser.setLastName(user.getLastName());
            User saved = userRepository.save(existingUser);

            // ── Keycloak ──
            String token = getAdminToken();
            String keycloakId = getKeycloakUserId(token, user.getUsername());
            Map<String, Object> payload = new HashMap<>();
            payload.put("firstName", user.getFirstName());
            payload.put("lastName", user.getLastName());
            patchKeycloakUser(token, keycloakId, payload);

            System.out.println("Full name updated for: " + user.getUsername());
            return saved;
        } catch (Exception e) {
            System.out.println("Error Updating Full Name");
            e.printStackTrace();
            return null;
        }
    }

    public User setUserPhoneNumber(String username, String number) {
        try {
            // ── MongoDB ──
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            user.setPhone(number);
            User saved = userRepository.save(user);

            // ── Keycloak ──
            String token = getAdminToken();
            String keycloakId = getKeycloakUserId(token, username);
            Map<String, List<String>> attributes = new HashMap<>();
            attributes.put("phoneNumber", Arrays.asList(number));
            Map<String, Object> payload = new HashMap<>();
            payload.put("attributes", attributes);
            patchKeycloakUser(token, keycloakId, payload);

            System.out.println("Phone number updated for: " + username);
            return saved;
        } catch (Exception e) {
            System.out.println("Error Updating Phone Number");
            e.printStackTrace();
            return null;
        }
    }

    public User setUserEmail(String username, String email) {
        try {
            // ── MongoDB ──
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            user.setEmail(email);
            User saved = userRepository.save(user);

            // ── Keycloak ──
            String token = getAdminToken();
            String keycloakId = getKeycloakUserId(token, username);
            Map<String, Object> payload = new HashMap<>();
            payload.put("email", email);
            payload.put("emailVerified", false);
            payload.put("requiredActions", Arrays.asList("VERIFY_EMAIL"));
            patchKeycloakUser(token, keycloakId, payload);

            System.out.println("Email updated for: " + username);
            return saved;
        } catch (Exception e) {
            System.out.println("Error Updating Email");
            e.printStackTrace();
            return null;
        }
    }

    public User setPassword(String username, String currentPassword, String newPassword) {
        try {
            // ── MongoDB ──
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            if (!user.getPassword().equals(currentPassword))
                throw new Exception("Current Password mismatch");
            user.setPassword(newPassword);
            User saved = userRepository.save(user);

            // ── Keycloak ──
            String token = getAdminToken();
            String keycloakId = getKeycloakUserId(token, username);
            String resetUrl = KEYCLOAK_USERS_URL + "/" + keycloakId + "/reset-password";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);
            Map<String, Object> credPayload = new HashMap<>();
            credPayload.put("type", "password");
            credPayload.put("value", newPassword);
            credPayload.put("temporary", false);
            rest.exchange(resetUrl, HttpMethod.PUT, new HttpEntity<>(credPayload, headers), Void.class);

            System.out.println("Password updated for: " + username);
            return saved;
        } catch (Exception e) {
            System.out.println("Error Updating Password");
            e.printStackTrace();
            return null;
        }
    }
public User addNotification(NotificationRequest notification) {
    try {
        User user = userRepository.findByUsername(notification.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Notification> notifications = user.getNotifications();
        notifications.addAll(notification.getNotifications());
        user.setNotifications(notifications);
        return userRepository.save(user);
    } catch (Exception e) {
        System.out.println("Error Adding Notification");
        e.printStackTrace();
        return null;
    }
}
}