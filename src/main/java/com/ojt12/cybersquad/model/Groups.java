package com.ojt12.cybersquad.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.context.annotation.EnableMBeanExport;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Table(name = "`groups`")
@Entity
public class Groups {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    private String photo;
    private boolean status = true;
    private int ownerId;
    private LocalDateTime deletedDate;
  @Transient
  private MultipartFile photoFile;

    @ManyToMany(mappedBy = "groups")
    private List<User> users=new ArrayList<>();

    @JsonManagedReference
    @OneToMany(mappedBy = "groups", cascade = CascadeType.PERSIST)
    private List<Content> contents;

    @JsonManagedReference
    @OneToMany(mappedBy = "groups", cascade = CascadeType.PERSIST)
    private List<Share> shares;

    @JsonManagedReference
    @OneToMany(mappedBy = "groups", cascade = CascadeType.PERSIST)
    private List<Poll> polls;

    @JsonManagedReference
    @OneToMany(mappedBy = "group", cascade = CascadeType.PERSIST)
    private List<Notification> notifications;

}
