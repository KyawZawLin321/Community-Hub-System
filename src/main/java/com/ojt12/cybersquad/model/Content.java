package com.ojt12.cybersquad.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Formula;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

// kym //
@Entity
@Table(name = "content")
@Getter
@Setter
public class Content {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(nullable = true)
    private String text;
    @Column(nullable = true)
    private String isPublic;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private boolean status;
    private LocalDateTime deletedDate;
    private int likeCount;

    @Transient
    private MultipartFile multipartFile;

    @Transient
    private int userId; // Transient field to hold userId

    @Transient
    private int groupId; // Transient field to hold groupId

    private String photo;

    @Transient
    private String name;

    @Transient
    private  String staffId;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "group_id")
    private Groups groups;

    @JsonManagedReference
    @OneToMany(mappedBy = "content", cascade = CascadeType.REMOVE)
    private List<Resource> resources;

    @JsonManagedReference
    @OneToMany(mappedBy = "content", cascade = CascadeType.REMOVE)
    private List<Share> shares ;


    @OneToMany(mappedBy = "content", cascade = CascadeType.REMOVE)
    @JsonIgnore
    private List<Remark> remark ;

    @OneToMany(mappedBy = "content", cascade = CascadeType.REMOVE)
    @JsonIgnore
    private List<Notification> notifications;

    @OneToMany(mappedBy = "content", cascade = CascadeType.REMOVE)
    @JsonIgnore
    private List<Comment> comments;

    @OneToMany(mappedBy = "content", cascade = CascadeType.REMOVE)
    @JsonIgnore
    private List<Reply> replies;

    public Content(int postId) {
        this.id = postId;
    }

    public Content() {
    }

    @Transient
    private List<String> imageUrls;


    @Transient
    private List<String> videoUrls;



    // Other fields and mappings...

    public void setImageUrls(List<Resource> resources) {
        this.imageUrls = resources.stream()
                .filter(resource -> resource.getImageUrl() != null)
                .map(Resource::getImageUrl)
                .collect(Collectors.toList());
    }

    public void setVideoUrls(List<Resource> resources) {
        this.videoUrls = resources.stream()
                .filter(resource -> resource.getVideoUrl() != null)
                .map(Resource::getVideoUrl)
                .collect(Collectors.toList());
    }
//swm
    public void incrementLikeCount() {
        this.likeCount++;
    }

    public void decrementLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }



    //swm

}
// kym //

