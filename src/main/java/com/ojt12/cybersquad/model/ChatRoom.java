package com.ojt12.cybersquad.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "chatroom")
@Getter
@Setter
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String chatId;

    private int recipientId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
