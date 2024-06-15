package com.ojt12.cybersquad.controller;


import com.ojt12.cybersquad.model.Content;
import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.service.*;
import org.cloudinary.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/*STRM*/

@Controller
public class ReportController {

    @Autowired
    private ContentService contentService;

    @Autowired
    private RemarkService remarkService;

    @Autowired
    private CommentService commentService;

    @Autowired
    private ShareService shareService;

    @Autowired
    private UserService userService;


    /*Report*/

    @GetMapping("/admin/report/{id}")
    public String getReportPage(@PathVariable int id, Model model) {
        model.addAttribute("id", id);
        return "admin/report";
    }

    @GetMapping("/admin/report/data/{id}")
    public ResponseEntity<Map<String, Object>> getReportData(@PathVariable int id) {
        try {
            Map<String, Object> data = new HashMap<>();


            // total count
            int contentCount = contentService.countContentByUserId(id);
            int likeCount = remarkService.countLikesByUserId(id);
            int commentCount = commentService.countCommentsByUserId(id);
            int shareCount = shareService.countSharesByUserId(id);

            data.put("postCount", contentCount);
            data.put("likeCount", likeCount);
            data.put("commentCount", commentCount);
            data.put("shareCount", shareCount);


            // trending content
            List<Content> contents = contentService.getContentsByUserId(id);
            Content mostPopularContent = null;
            int maxTotalCount = 0;

            for (Content content : contents) {
                int contentId = content.getId();
                int totalCount = shareService.countSharesByContentId(contentId) +
                        commentService.countCommentsByContentId(contentId) +
                        remarkService.countLikesByContentId(contentId);
                if (totalCount > maxTotalCount) {
                    maxTotalCount = totalCount;
                    mostPopularContent = content;
                }
            }

            if (mostPopularContent != null) {
                data.put("mostPopularContent", mostPopularContent.getId());
            }

            // Count of content created within the last week
            int contentCountWithinOneWeek = contentService.getContentCountWithinOneWeek(id);
            int likeCountWithinOneWeek = remarkService.getLikeCountWithinOneWeek(id);
            int commentCountWithinOneWeek = commentService.getCommentCountWithinOneWeek(id);
            int shareCountWithinOneWeek = shareService.getShareCountWithinOneWeek(id);


            data.put("contentCountWithinOneWeek", contentCountWithinOneWeek);
            data.put("likeCountWithinOneWeek", likeCountWithinOneWeek);
            data.put("commentCountWithinOneWeek", commentCountWithinOneWeek);
            data.put("shareCountWithinOneWeek", shareCountWithinOneWeek);

            return ResponseEntity.ok(data);
        } catch (Exception e) {
            // Log the exception or handle it as needed
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }






}



/*STRM*/