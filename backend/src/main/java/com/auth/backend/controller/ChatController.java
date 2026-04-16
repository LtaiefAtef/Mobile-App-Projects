package com.auth.backend.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.auth.backend.dto.ChatMessage;

@Controller
public class ChatController {

    // Client sends to: /app/chat
    @MessageMapping("/chat")
    // Server broadcasts to: /topic/messages
    @SendTo("/topic/messages")
    public ChatMessage handleMessage(ChatMessage message) {
        System.out.println("Received: "+  message.getMsgType() + " : " + message.getText());
        return message;
    }
}