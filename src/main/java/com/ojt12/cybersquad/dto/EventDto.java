

package com.ojt12.cybersquad.dto;

import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.Setter;

import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class EventDto {

    private int id;

    private String content;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private LocalDateTime createdDate;

    private LocalDateTime updatedDate;

    private String photoFile;

    @Transient
    private MultipartFile multipartFile;

    private String eventDetails;

    private Boolean status;
    private int userId;

    public EventDto(int  id, String content,String eventDetails, LocalDateTime startDate, LocalDateTime endDate,String photoFile,int userId) {
        this.id=id;
        this.content=content;
        this.eventDetails=eventDetails;
        this.startDate=startDate;
        this.endDate=endDate;
        this.photoFile=photoFile;
        this.userId=userId;
    }




public EventDto(int id, String content, LocalDateTime startDate, LocalDateTime endDate, LocalDateTime createdDate, LocalDateTime updatedDate, String photoFile, MultipartFile multipartFile, String eventDetails, Boolean status) {
    this.id = id;
    this.content = content;
    this.startDate = startDate;
    this.endDate = endDate;
    this.createdDate = createdDate;
    this.updatedDate = updatedDate;
    this.photoFile = photoFile;
    this.multipartFile = multipartFile;
    this.eventDetails = eventDetails;
    this.status = status;
}
}


