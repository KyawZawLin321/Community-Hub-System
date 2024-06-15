package com.ojt12.cybersquad.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Entity
@Getter
@Setter
@Table(name = "group_message")
public class GroupMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String content;
    private Date time;
    @Transient
    private int senderId;
    private String name;
    @Transient
    private int roomId;
    private String type;
    private boolean status;
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
    @ManyToOne
    @JoinColumn(name = "group_id")
    @JsonIgnore
    private Groups groups;


}
