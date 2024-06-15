package com.ojt12.cybersquad.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReplyDto {
    int id;
    int contentId;
    int commentId;
    int shareId;
    String userId;
    String reply;
    LocalDateTime time;
}
