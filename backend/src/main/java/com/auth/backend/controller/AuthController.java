package com.auth.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.auth.backend.dto.LoginRequest;
import com.auth.backend.dto.SignupRequest;
import com.auth.backend.dto.TokenResponse;
import com.auth.backend.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService=authService;
    }

    @PostMapping("/login")
    public TokenResponse login(@RequestBody LoginRequest request){
        return authService.login(request);
    }
    @PostMapping("/signup")
    public boolean signup(@RequestBody SignupRequest request){
        System.out.println("Received signup request: " + request);
        return authService.signup(request);
    }
    @PostMapping("/resend-verification")
    public void resend(@RequestParam String username){
        System.out.println("Received resend verification request for username: " + username);
        authService.resendVerification(username);
    }
    @GetMapping("/is-verified")
    public ResponseEntity<Boolean> isVerified(@RequestParam String username) {
        System.out.println("Received is-verified request for username: " + username);
        return ResponseEntity.ok(authService.isEmailVerified(username));
    }
}