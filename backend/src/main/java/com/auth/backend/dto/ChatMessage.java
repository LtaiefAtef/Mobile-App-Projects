package com.auth.backend.dto;

public class ChatMessage {
    private String text;
    private Type msgType;

    public ChatMessage() {
    }

    public ChatMessage(String text, Type msgType) {
        this.text = text;
        this.msgType = msgType;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
    public void setMsgType(Type msgType) {
        this.msgType = msgType;
    }
    public Type getMsgType() {
        return msgType;
    }
    public enum Type {
        REDIRECT,
        STEP1,
        STEP2,
        STEP3,
        STEP4
    }
}