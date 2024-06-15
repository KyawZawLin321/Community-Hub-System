package com.ojt12.cybersquad.model;

import com.ojt12.cybersquad.dto.ContentDto;
import com.ojt12.cybersquad.dto.EventDto;
import com.ojt12.cybersquad.dto.GroupsDto;
import com.ojt12.cybersquad.dto.UserDto;

import java.util.List;

public class SearchResult {
    private List<UserDto> users;
    private List<ContentDto> contents;
    private List<GroupsDto> groups;
    private List<EventDto> events;

    // Constructors, getters, setters, etc.

    // Example constructor (add others as needed)
    public SearchResult(List<UserDto> users,List<ContentDto> contents,List<GroupsDto> groups,List <EventDto> events) {
        this.users = users;
        this.contents=contents;
        this.groups=groups;
        this.events=events;
    }



    public List<UserDto> getUsers() {
        return users;
    }

    public List<ContentDto> getContents() {
        return contents;
    }

    public List<GroupsDto> getGroups() {
        return groups;
    }
    public List<EventDto> getEvents() {
        return events;
    }
}
