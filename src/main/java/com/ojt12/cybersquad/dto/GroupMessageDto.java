package com.ojt12.cybersquad.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
@Getter
@Setter
public class GroupMessageDto {
    private int id;
    private String content;
    private Date time;
    private int roomId;
    private int senderId;
    private String name;
    private String type;

    public GroupMessageDto(String content, Date time, int senderId, int roomId,String name,String type,int id) {
        this.content = content;
        this.time = time;
        this.senderId = senderId;
        this.roomId=roomId;
        this.name=name;
        this.type=type;
        this.id=id;
    }
}
