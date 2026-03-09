package com.auth.backend.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.auth.backend.dto.LoginRequest;
import com.auth.backend.dto.TokenResponse;

@Service
public class AuthService {
    private final String KEYCLOAK_TOKEN_URL = "http://localhost:8080/realms/mobile-realm/protocol/openid-connect/token";
    private final String CLIENT_ID = "mobile-client";
    public TokenResponse login(LoginRequest request){
        RestTemplate rest = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type","password");
        body.add("client_id",CLIENT_ID);
        body.add("username", request.getUsername());
        body.add("password",request.getPassword());
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body,headers);
        
        return  rest.postForObject(KEYCLOAK_TOKEN_URL, entity, TokenResponse.class);
    }
}
