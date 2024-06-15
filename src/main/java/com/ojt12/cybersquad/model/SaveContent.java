package com.ojt12.cybersquad.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "save")
@Getter
@Setter
public class SaveContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    int userId;
    int contentId;
    boolean status;

    public SaveContent(int id, int userId, int contentId) {
        this.id = id;
        this.userId = userId;
        this.contentId = contentId;
    }

    public SaveContent() {
    }
}
