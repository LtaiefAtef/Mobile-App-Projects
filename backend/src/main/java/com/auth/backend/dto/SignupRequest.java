package com.auth.backend.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String prename;
    private String familyName;
    private String username;
    private String phoneNumber;
    private String email;
    private String password;
}