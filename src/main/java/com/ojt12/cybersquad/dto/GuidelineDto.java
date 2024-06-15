package com.ojt12.cybersquad.dto;

import com.ojt12.cybersquad.model.User;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;


import java.time.LocalDateTime;


@Getter
@Setter
public class GuidelineDto {
    private int id;
    private String title;
    private String description;
    private String photo;
    private int userId;
    private boolean guidelineSeen;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private String createdBy;
    private String updatedBy;
    private String role;


    public GuidelineDto(int id, String title, String description, String photo, int userId,boolean guidelineSeen,LocalDateTime createdDate,LocalDateTime updatedDate,String createdBy,String updatedBy,String role) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.photo = photo;
        this.userId = userId;
        this.guidelineSeen=guidelineSeen;
        this.createdDate=createdDate;
        this.updatedDate=updatedDate;
        this.createdBy=createdBy;
        this.updatedBy=updatedBy;
        this.role=role;

    }
}
