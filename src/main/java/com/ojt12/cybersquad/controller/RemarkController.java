package com.ojt12.cybersquad.controller;


import com.ojt12.cybersquad.dto.CommentDto;
import com.ojt12.cybersquad.dto.NotificationDto;
import com.ojt12.cybersquad.model.Remark;
import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.service.ContentService;
import com.ojt12.cybersquad.service.NotificationService;
import com.ojt12.cybersquad.service.RemarkService;
import com.ojt12.cybersquad.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/content")
public class RemarkController {
    @Autowired
    private RemarkService remarkService;
    @Autowired
    NotificationService notificationService;
    @Autowired
    private UserService userService;
@PostMapping("/{contentId}/like")
public ResponseEntity<?> likePost(@PathVariable int contentId) {
    String staffId = SecurityContextHolder.getContext().getAuthentication().getName();
    User user = userService.findByStaffId(staffId);
    boolean liked = remarkService.likePost(contentId, user);
    return ResponseEntity.ok().body(Map.of("liked", liked));
}

    @GetMapping("/{contentId}/like-count")
    public ResponseEntity<Integer> getLikeCount(@PathVariable int contentId) {
        int likeCount = remarkService.getLikeCount(contentId);
        return ResponseEntity.ok(likeCount);
    }

    @GetMapping("/{contentId}/like/status")
    public ResponseEntity<?> getLikeStatus(@PathVariable int contentId) {
        String staffId = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByStaffId(staffId);
        boolean liked = remarkService.isUserLiked(contentId, user);
        return ResponseEntity.ok().body(Map.of("liked", liked));
    }




}
