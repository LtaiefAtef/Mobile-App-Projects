package com.auth.backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.auth.backend.config.JwtDecoderProvider;
import com.auth.backend.dto.AdminLoginRequest;
import com.auth.backend.dto.TokenResponse;
import com.auth.backend.logs.BackendLogger;

@Service
public class AdminAuthService {

    private final String KEYCLOAK_TOKEN_URL = "http://localhost:8080/realms/mobile-realm/protocol/openid-connect/token";
    private final String CLIENT_ID = "mobile-client";

    public TokenResponse login(AdminLoginRequest request){
        try{
            RestTemplate rest = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type","password");
            body.add("client_id",CLIENT_ID);
            body.add("username", request.getEmployeeId());
            body.add("password", request.getPassword());

            HttpEntity<MultiValueMap<String, String>> entity =
                new HttpEntity<>(body,headers);

            TokenResponse token =
                rest.postForObject(KEYCLOAK_TOKEN_URL, entity, TokenResponse.class);

            if (token == null) {
                throw new RuntimeException("Login failed");
            }

            // Check admin role
            if (!hasAdminRole(token.getAccess_token())) {
                throw new RuntimeException("Access denied: not an admin");
            }

            return token;

        } catch (Exception e){
            BackendLogger.logError("Admin Login Error", "backend/src/main/java/com/auth/backend/service/AdminAuthService.java",e);
            // throw new RuntimeException("Admin login failed: " + e.getMessage());
            return null;
        }
    }

    private boolean hasAdminRole(String accessToken) {
        try {
            Jwt jwt = JwtDecoderProvider.create().decode(accessToken);

            Map<String, Object> realmAccess =
                (Map<String, Object>) jwt.getClaims().get("realm_access");

            List<String> roles = (List<String>) realmAccess.get("roles");

            return roles.contains("Admin");

        } catch (Exception e) {
            return false;
        }
    }
}