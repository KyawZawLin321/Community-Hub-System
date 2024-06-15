package com.ojt12.cybersquad.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "share")
@Getter
@Setter

public class Share {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String caption;
    private int share ;
    private int shareUserId;
    private String isPublic;
    private boolean status;
    private LocalDateTime time;
    private LocalDateTime updatedDate;
    private int likeCount;


    @Transient
    private int userId; // Transient field to hold userId
    @Transient
    private int contentId; // Transient field to hold userId
    @Transient
    private int groupId; // Transient field to hold userId

    @ManyToOne
//    @JsonIgnore
    @JsonBackReference
    @JoinColumn(name = "content_id")
    private Content content;
    @ManyToOne
//    @JsonIgnore
    @JsonBackReference
    @JoinColumn(name = "user_id")
    private User user;
    @ManyToOne
//    @JsonIgnore
    @JsonBackReference
    @JoinColumn(name = "group_id")
    private Groups groups;

     @OneToMany(mappedBy = "share", cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    @JsonIgnore
    private List<Remark> remarks;

    @OneToMany(mappedBy = "share", cascade = CascadeType.PERSIST)
    @JsonIgnore
    private List<Comment> comments;

    @OneToMany(mappedBy = "share", cascade = CascadeType.PERSIST)
    @JsonIgnore
    private List<Reply> replies;

    @OneToMany(mappedBy = "share", cascade = CascadeType.PERSIST)
    @JsonIgnore
    private List<Notification> notifications;

    //swm
    public void incrementLikeCount() {
        this.likeCount++;
    }

    public void decrementLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }

}
