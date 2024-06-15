package com.ojt12.cybersquad.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupsDto {
    private int id;
    private String name;
    private String photo;
    private boolean status;
    private int ownerId;
    public GroupsDto(int id, String name, String photo,boolean status) {
        this.id = id;
        this.name = name;
        this.photo = photo;
        this.status=status;
    }


}
