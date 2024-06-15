package com.ojt12.cybersquad.dto;
import jakarta.persistence.Column;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;


//kym//
@Getter
@Setter
public class ContentDto {

    private int id;
    private String text;
    private String isPublic;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private boolean status;
    private List<String> imageUrls; // Add field for image URLs
    private List<String> videoUrls; // Add field for video URLs
    private int userId;
    private String photo;
    private String name;
    private int likeCount;
    private String staffId;
    public ContentDto(int id, String text, String isPublic, LocalDateTime createdDate, LocalDateTime updatedDate, boolean status, List<String> imageUrls, List<String> videoUrls) {
        this.id = id;
        this.text = text;
        this.isPublic = isPublic;
        this.createdDate = createdDate;
        this.updatedDate = updatedDate;
        this.status = status;
        this.imageUrls = imageUrls;
        this.videoUrls = videoUrls;
    }
    public ContentDto(int id, String text, String isPublic, LocalDateTime createdDate, LocalDateTime updatedDate, boolean status, List<String> imageUrls, List<String> videoUrls,int userId,int likeCount) {
        this.id = id;
        this.text = text;
        this.isPublic = isPublic;
        this.createdDate = createdDate;
        this.updatedDate = updatedDate;
        this.status = status;
        this.imageUrls = imageUrls;
        this.videoUrls = videoUrls;
        this.userId=userId;
        this.likeCount=likeCount;

    }

    public ContentDto(int id, String text, String isPublic, LocalDateTime createdDate, LocalDateTime updatedDate, boolean status, List<String> imageUrls, List<String> videoUrls,int userId,int likeCount,String photo,String name,String staffId) {
        this.id = id;
        this.text = text;
        this.isPublic = isPublic;
        this.createdDate = createdDate;
        this.updatedDate = updatedDate;
        this.status = status;
        this.imageUrls = imageUrls;
        this.videoUrls = videoUrls;
        this.userId=userId;
        this.likeCount=likeCount;
        this.photo=photo;
        this.name=name;
        this.staffId=staffId;

    }


    public ContentDto(int id,String text){
    this.id=id;
    this.text=text;
    }
}
//kym//