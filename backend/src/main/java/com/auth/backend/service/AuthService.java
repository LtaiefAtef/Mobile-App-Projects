package com.auth.backend.service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.auth.backend.dto.LoginRequest;
import com.auth.backend.dto.TokenResponse;
import com.auth.backend.logs.BackendLogger;
import com.auth.backend.dto.SignupRequest;

@Service
public class AuthService {
    private final String KEYCLOAK_TOKEN_URL = "http://localhost:8080/realms/mobile-realm/protocol/openid-connect/token";
    private final String CLIENT_ID = "mobile-client";
    // Login Service
    public TokenResponse login(LoginRequest request){
        try{
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
        }catch(Exception e){
            BackendLogger.logError("Login Error", "backend/src/main/java/com/auth/backend/service/AuthService.java",e);
            return null;
        }
    }
    
    // SignUp Service
    public boolean signup(SignupRequest request){
        try{
            
                RestTemplate rest = new RestTemplate();
        // Admin token
        String adminTokenUrl = "http://localhost:8080/realms/master/protocol/openid-connect/token";
        MultiValueMap<String,String> adminBody = new LinkedMultiValueMap<>();
        adminBody.add("grant_type","password");
        adminBody.add("client_id","admin-cli");
        adminBody.add("username","admin");
        adminBody.add("password","admin");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String,String>> adminEntity = new HttpEntity<>(adminBody,headers);
        Map<String,Object> tokenRes = rest.postForObject(adminTokenUrl, adminEntity, Map.class);
        String acessToken = (String) tokenRes.get("access_token");
        // Create user 
        String createUserUrl = "http://localhost:8080/admin/realms/mobile-realm/users";
        HttpHeaders createHeaders = new HttpHeaders();
        createHeaders.setContentType(MediaType.APPLICATION_JSON);
        createHeaders.setBearerAuth(acessToken);

        Map<String,Object> user = new HashMap<>();
        user.put("username", request.getUsername());
        user.put("email",request.getEmail());
        user.put("firstName",request.getPrename());
        user.put("lastName", request.getFamilyName());
        user.put("enabled",true);

        // Add password
        Map<String,String> creds = new HashMap<>();
        creds.put("type", "password");
        creds.put("value", request.getPassword());
        creds.put("temporary", "false");
        user.put("credentials", Arrays.asList(creds));

        // Add phoneNumber as attrbute
        Map<String,List<String>> attributes = new HashMap<>();
        attributes.put("phoneNumber", Arrays.asList(request.getPhoneNumber()));
        user.put("attributes", attributes);

        HttpEntity<Map<String,Object>> createEntity = new HttpEntity<>(user, createHeaders);
        rest.postForObject(createUserUrl, createEntity, String.class);

        return true;
        }catch(Exception e){
            BackendLogger.logError("Sign Up Error", "backend/src/main/java/com/auth/backend/service/AuthService.java",e);
            return false;
        }
    }
}
