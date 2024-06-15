package com.ojt12.cybersquad.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

// kym //

@Getter
@Setter
public class PollRequestDTO {
    private String question;
    private String isPublic;
    private LocalDateTime endDate;
    private List<String> optionTexts;
    private int userId;
    private int groupId;


}
// kym //