package com.ojt12.cybersquad.controller;

import com.ojt12.cybersquad.dto.ContentDto;
import com.ojt12.cybersquad.dto.EventDto;
import com.ojt12.cybersquad.dto.GroupsDto;
import com.ojt12.cybersquad.dto.UserDto;
import com.ojt12.cybersquad.model.*;
import com.ojt12.cybersquad.service.ContentService;
import com.ojt12.cybersquad.service.EventService;
import com.ojt12.cybersquad.service.GroupService;
import com.ojt12.cybersquad.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;
@RestController

public class SearchController {
    @Autowired
    private UserService userService;

    @Autowired
    private GroupService groupService;

    @Autowired
    private ContentService contentService;

    @Autowired
    private EventService eventService;

    @PostMapping("/api/search")
    public SearchResult search(@RequestBody String q) throws UnsupportedEncodingException {
        String query = q.toLowerCase();
        String[] parts = query.split("=");

        String keyword = parts.length >= 2 ? parts[1].toLowerCase().trim(): "";

        String decodeSearchString = URLDecoder.decode(keyword, StandardCharsets.UTF_8);
        String result = decodeSearchString.replaceAll("[ /]", "");
        System.out.println(result);

        List<UserDto> matchingUsers = userService.searchUser(result);
        List<ContentDto> matchingContents = contentService.searchContent(result);
        List<GroupsDto> matchingGroups = groupService.searchGroup(result);
        List<EventDto> matchingEvents = eventService.searchEvent(result);



        return new SearchResult(matchingUsers,matchingContents,matchingGroups,matchingEvents);
    }

}
