package com.ojt12.cybersquad.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

// kym //
@Getter
@Setter
@Entity
@Table(name = "resource")
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
//    @ElementCollection
    @Column(nullable = true)
    private String imageUrl;
    @Column(nullable = true)
    private String videoUrl;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "content_id")
//    @JsonIgnore
    private Content content;

}

// kym //