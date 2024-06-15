package com.ojt12.cybersquad.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "reply")
public class Reply {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String reply;
    private LocalDateTime time;
    boolean liked;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    @ManyToOne
    @JoinColumn(name = "remark_id")
    private Remark remark;
    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "comment_id")
    private Comment comment;
    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "content_id")
    private Content content;
     @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "share_id")
    private Share share;
}
