package com.auth.backend.dto;

import lombok.Data;

@Data
public class AddClaimRequest {
    private String claimId;
    private String username;
}