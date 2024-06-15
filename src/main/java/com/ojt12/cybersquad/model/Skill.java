package com.ojt12.cybersquad.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//kym //

@Entity
@Table(name = "skill") // Change the table name here
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = true)
    private String skillOption;

    private boolean status;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "user_id")
    private User user;


}
// kym //