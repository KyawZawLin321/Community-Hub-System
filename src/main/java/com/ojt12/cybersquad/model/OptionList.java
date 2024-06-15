package com.ojt12.cybersquad.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
@Entity
@Table(name = "option_list") // Change the table name here
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OptionList {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private int id;

        @Column(nullable = true)
        private String optionText;

        private boolean status;

        @ManyToOne
        @JsonBackReference
        @JoinColumn(name = "poll_id")
        private Poll poll;
}
