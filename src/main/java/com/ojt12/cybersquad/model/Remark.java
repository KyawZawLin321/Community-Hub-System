package com.ojt12.cybersquad.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "remark")
@Getter
@Setter

public class Remark {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private boolean likes;
    private LocalDateTime time;
    @ManyToOne
    @JoinColumn(name = "content_id")
    private Content content;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "share_id")
    private Share share;

}
