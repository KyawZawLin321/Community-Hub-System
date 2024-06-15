package com.ojt12.cybersquad.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;


// kym //

@Setter
@Getter
public class UpdatePollRequest {

    private int id;
    private List<String> optionTexts; // Change to List<String> for array of option texts
    private String isPublic;
    private LocalDateTime endDate;


    // Getters and setters
}
// kym //