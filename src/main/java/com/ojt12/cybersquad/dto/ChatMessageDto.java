package com.ojt12.cybersquad.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
@Getter
@Setter
public class ChatMessageDto {
    private String content;
    private Date time;
    private String recipientId;
    private String chatId;
    private int senderId;
    private String type;

    public ChatMessageDto(String content, Date time, String recipientId, int senderId, String chatId,String type) {
        this.content = content;
        this.time = time;
        this.recipientId = recipientId;
        this.senderId = senderId;
        this.chatId=chatId;
        this.type=type;
    }

}
