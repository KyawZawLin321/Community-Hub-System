package com.ojt12.cybersquad.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CommentDto {
    int id;
    int contentId;
    int userId;
    int shareId;
    String comment;
    LocalDateTime time;
}
