package com.ojt12.cybersquad.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String ownerId;
    private String message;
    private String photo;
    private LocalDateTime time;
    private boolean isRead;
    private String type;

    @ManyToOne
    @JoinColumn(name = "event_id")
    @JsonIgnoreProperties("notifications")
    private Event event;

    @ManyToOne
    @JoinColumn(name = "group_id")
    @JsonIgnoreProperties("notifications")
    private Groups group;

    @ManyToOne
    @JoinColumn(name = "content")
    @JsonIgnoreProperties("notifications")
    private Content content;
    
    @ManyToOne
    @JoinColumn(name = "share")
    @JsonIgnoreProperties("notifications")
    private Share share;
}
