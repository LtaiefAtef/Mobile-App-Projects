package com.auth.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.auth.backend.dto.AdminLoginRequest;
import com.auth.backend.dto.ChangePasswordRequest;
import com.auth.backend.dto.LoginRequest;
import com.auth.backend.dto.SignupRequest;
import com.auth.backend.dto.TokenResponse;
import com.auth.backend.dto.User;
import com.auth.backend.service.AdminAuthService;
import com.auth.backend.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    private final AdminAuthService adminAuthService;
    public AuthController(AuthService authService, AdminAuthService adminAuthService){
        this.authService=authService;
        this.adminAuthService=adminAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request){
        return authService.login(request);
    }
    @PostMapping("/admin/login")
    public TokenResponse adminLogin(@RequestBody AdminLoginRequest request){
        return adminAuthService.login(request);
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
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@RequestBody Map<String, String> body) {
        System.out.println("REFRESH TOKEN REQUESTED");
        TokenResponse response = authService.refreshToken(body.get("refreshToken"));
        if (response == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(response);
    }
        // Delete User by username
    @DeleteMapping("/delete-user/{username}")
    public ResponseEntity<String> deleteUser(@PathVariable String username) {
        System.out.println("Deleting a user");
        authService.deleteUser(username);
        return ResponseEntity.ok("User deleted successfully");
    }
    // Modify Fullname 
    @PutMapping("/modify-fullname")
    public ResponseEntity<User> modifyFullName(@RequestBody User user){
        System.out.println(user.getFirstName() + " " + user.getLastName());
        return ResponseEntity.ok(authService.setUserFullName(user));
    }
    // Modify email
    @PutMapping("/modify-email")
    public ResponseEntity<User> modifyUsername(@RequestBody User user){
        return ResponseEntity.ok(authService.setUserEmail(user.getUsername(), user.getEmail()));
    }
    // Modify phone number
    @PutMapping("/modify-phone")
    public ResponseEntity<User> modifyPhone(@RequestBody User user){
        System.out.println("Changing Phone");
        return ResponseEntity.ok(authService.setUserPhoneNumber(user.getUsername(), user.getPhone()));
    }
    // Modify Password
    @PutMapping("/modify-password")
    public ResponseEntity<User> modifyPassword(@RequestBody ChangePasswordRequest request){
        System.out.println("Changing password");
        return ResponseEntity.ok(authService.setPassword(request.getUsername(), request.getCurrentPassword(), request.getNewPassword()));
    }
}