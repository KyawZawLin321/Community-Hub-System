package com.ojt12.cybersquad.dto;

public class UserResponse {

    private String name;
    private int id;  // Changed to int if IDs are numeric

    private String staffId;

    public UserResponse(int id, String name) {
    }

    public UserResponse() {

    }

    // Getters and setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getStaffId() {
        return staffId;
    }

    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }
}
