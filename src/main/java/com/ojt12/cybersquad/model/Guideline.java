package com.ojt12.cybersquad.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;


@Entity
@Getter
@Setter
@Table(name="`guideline`")
public class Guideline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String title;
    private String description;
    private String photo;


    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private String createdBy;
    private String updatedBy;
    private String role;

    @OneToOne
    @JoinColumn(name="user_id")
    private User user;

}
