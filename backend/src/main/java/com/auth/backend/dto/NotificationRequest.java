package com.auth.backend.dto;

import java.util.List;

import com.auth.backend.dto.User.Notification;

import lombok.Data;
@Data
public class NotificationRequest{
    private List<Notification> notifications;
    private String username;
}