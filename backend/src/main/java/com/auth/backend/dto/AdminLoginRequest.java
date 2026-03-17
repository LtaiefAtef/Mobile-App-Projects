package com.auth.backend.dto;

import lombok.Data;

@Data
public class AdminLoginRequest {
    private String employeeId;
    private String password;
}
