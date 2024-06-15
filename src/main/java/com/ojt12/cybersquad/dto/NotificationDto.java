package com.ojt12.cybersquad.dto;

import com.ojt12.cybersquad.model.Content;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
public class NotificationDto {
    private  int id;
    private String ownerId;
    private String message;
    private LocalDateTime time;
    private String photo;
    private String contentId;
    private String shareId;
    private String eventId;
    private String groupId;
    private String type;
    boolean isRead;


    public NotificationDto(String message) {
        this.message = message;

    }

    public NotificationDto() {
    }

    public NotificationDto(String ownerId, String message, Content content, LocalDateTime time) {
    }

    public NotificationDto(String ownerId, String message, Content content, LocalDateTime time, String photo) {
    }
     public NotificationDto(String message, String photo, LocalDateTime time) {
    }
}
