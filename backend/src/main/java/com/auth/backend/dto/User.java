package com.auth.backend.dto;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String currentPassword;
    private String password;
    private List<String> myClaims;
    private List<Notification> notifications = new ArrayList<>();
    private LocalDateTime createdAt = LocalDateTime.now();
    @Data
    public static class Notification{
        private String title;
        private String message;
        private String timestamp;
    }
}