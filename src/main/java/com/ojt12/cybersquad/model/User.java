package com.ojt12.cybersquad.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


@Entity
@Getter
@Setter
@Table(name = "user")
public class User {
    /*KZL*/

    @Id
    private int id;
    private String staffId;
    private String division;
    private LocalDate dob;
    private String name;
    private String password;
    private String email;
    private int doorLogId;
    private String department;
    private String team;
    private String photo="http://res.cloudinary.com/dpkpqujgu/image/upload/v1712777714/433f1c08-0cf2-425a-a614-a6fe871108b1.jpg";
    private String coverPhoto="http://res.cloudinary.com/dpkpqujgu/image/upload/v1712777705/583449ea-d7b2-48c2-81cd-0005b47f30f9.jpg";
    @Column(nullable = true)
    private String skill;
    private String interest;
    private String  biography;
    private Boolean accept=true;
    @Enumerated(EnumType.STRING)
    private Role role=Role.User;
    @Enumerated(EnumType.STRING)
    private Role pendingRole;
    @Transient
    private String newPassword;
    @Transient
    private String confirmPassword;
    private String createDate;
    private String reason;
    private Boolean reasonModalDisplayed;
    private boolean notificationsEnabled = true;

    @ManyToMany(cascade = { CascadeType.MERGE },fetch = FetchType.EAGER)
    @JoinTable(name="users_have_groups",joinColumns = @JoinColumn(name="user_id"),
            inverseJoinColumns = @JoinColumn(name = "groups_id")
    )
    private List<Groups> groups = new ArrayList<>();
    @JsonManagedReference
    @OneToMany(mappedBy = "user", cascade = CascadeType.PERSIST)
    private List<Poll> polls;

    @JsonManagedReference
    @OneToMany(mappedBy = "user", cascade = CascadeType.PERSIST)
    private List<Vote> votes;

    @JsonManagedReference
    @OneToMany(mappedBy = "user", cascade = CascadeType.PERSIST)
    private List<Content> contents;

    @JsonManagedReference
    @OneToMany(mappedBy = "user", cascade = CascadeType.PERSIST)
    private List<Skill> skills;

    @JsonManagedReference
//    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.PERSIST)
    private List<Share> shares ;

    @OneToMany(mappedBy = "user", cascade = CascadeType.PERSIST)
    private List<Remark> remarks ;

    @OneToMany(mappedBy = "user", cascade = CascadeType.PERSIST)
    private List<Reply> replies;

    @OneToMany(mappedBy = "user", cascade = CascadeType.PERSIST)
    private List<ChatRoom> chatRooms;

    @OneToOne(mappedBy = "user")
    private Guideline guideline;

    @JsonManagedReference
    @OneToMany(mappedBy = "user", cascade = CascadeType.PERSIST)
    private List<Event> events;
    @OneToMany(mappedBy = "user", cascade = CascadeType.PERSIST)
    @JsonIgnore
    private List<ChatMessage> messages;

    @OneToMany(mappedBy = "user", cascade = CascadeType.PERSIST)
    private List<Comment> comments;


    public enum Role{
        Admin,User
    }
    private Boolean status=true;
    //Char Char
    private boolean guidelineSeen= false;
    private boolean groupInvite=false;
    //Char Char


    @Transient
    private MultipartFile file;

    public boolean isStatus() {
        return status;
    }

    /*KZL*/

    public User(int id, String staffId, String division, LocalDate dob, String name, String password, String email, int doorLogId, String department, String team, String photo, String coverPhoto, String skill, String interest, String biography, Role role, String newPassword, String confirmPassword, List<Content> contents, List<Remark> remarks, List<Reply> replies, List<ChatRoom> chatRooms, Guideline guideline, List<Event> events, List<ChatMessage> messages, Boolean status, MultipartFile file) {
        this.id = id;
        this.staffId = staffId;
        this.division = division;
        this.dob = dob;
        this.name = name;
        this.password = password;
        this.email = email;
        this.doorLogId = doorLogId;
        this.department = department;
        this.team = team;
        this.photo = photo;
        this.coverPhoto = coverPhoto;
        this.skill = skill;
        this.interest = interest;
        this.biography = biography;
        this.role = role;
        this.newPassword = newPassword;
        this.confirmPassword = confirmPassword;
        this.contents = contents;
        this.remarks = remarks;
        this.replies = replies;
        this.chatRooms = chatRooms;
        this.guideline= guideline;
        this.events = events;
        this.messages = messages;
        this.status = status;
        this.file = file;
    }

    public User(int userId) {
        this.id= userId;
    }
    public User() {
    }
}
