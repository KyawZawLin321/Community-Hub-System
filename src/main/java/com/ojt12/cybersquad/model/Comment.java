package com.ojt12.cybersquad.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name="comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String comment;
    private LocalDateTime time;
    boolean liked;
    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "content_id")
    private Content content;

    @OneToMany(mappedBy = "comment", cascade = CascadeType.PERSIST)
    @JsonIgnore
    private List<Comment> comments;
    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "share_id")
    private Share share;
    public String getFormattedTime() {
        return time.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }
}
