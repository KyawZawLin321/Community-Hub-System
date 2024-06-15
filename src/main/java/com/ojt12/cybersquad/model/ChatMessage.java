package com.ojt12.cybersquad.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "message")
@Getter
@Setter
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String content;
    private Date time;
    private String recipientId;
    private String chatId;
    private String type;
    @Transient
    private String senderId;
    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore // Ignore the user field during serialization
    private User user;


}
