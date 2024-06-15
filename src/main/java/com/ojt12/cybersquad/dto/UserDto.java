package com.ojt12.cybersquad.dto;

import com.ojt12.cybersquad.model.User;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class UserDto {
    private  int id;
    private String staffId;
    private String division;
    private LocalDate dob;
    private String name;
    private String password;
    private String email;
    private int doorLogId;
    private String department;
    private String team;
    private String photo;
    private String coverPhoto;
    private String skill;
    private String interest;
    private String biography;
    private Boolean accept;
    private List<String> skillOption;
    private String createDate;
    private String reason;
    private Boolean reasonModalDisplayed;

    private com.ojt12.cybersquad.model.User.Role role; // Use the correct enum type here
    private String pendingRole;
    public UserDto(String name) {
        this.name = name;
    }

    public UserDto(int id, String name) {
    }

    public UserDto(User user) {
    }

    public UserDto(int id, String reason, Boolean accept, User.Role role) {
    }


    public enum Role {
        Admin, User
    }

    private Boolean status;
    private MultipartFile file;

    public UserDto(String staffId, String name, String department, String team, User.Role role, String photo, int id) {
        this.staffId = staffId;
        this.name = name;
        this.department = department;
        this.team = team;
        this.role = role;
        this.photo = photo;
        this.id = id;
    }
    public UserDto(String staffId, String name, String department, String team, User.Role role, String photo, int id,String createDate) {
        this.staffId = staffId;
        this.name = name;
        this.department = department;
        this.team = team;
        this.role = role;
        this.photo = photo;
        this.id = id;
        this.createDate=createDate;
    }
    public UserDto(String staffId, String name, String department, String team, User.Role role, String photo, int id,Boolean accept) {
        this.staffId = staffId;
        this.name = name;
        this.department = department;
        this.team = team;
        this.role = role;
        this.photo = photo;
        this.id = id;
        this.accept=accept;
    }

    public UserDto(String staffId, String name, String department, String team, User.Role role, String photo, int id, String interest, LocalDate dob, String skill, String biography, String email, String coverPhoto) {
        this.staffId = staffId;
        this.name = name;
        this.department = department;
        this.team = team;
        this.role = role;
        this.photo = photo;
        this.id = id;
        this.interest = interest;
        this.dob = dob;
        this.skill = skill;
        this.biography = biography;
        this.email = email;
        this.coverPhoto = coverPhoto;
    }

    public UserDto() {
    }
}
