package com.ojt12.cybersquad.controller;

import com.ojt12.cybersquad.dto.CommentDto;
import com.ojt12.cybersquad.dto.NotificationDto;
import com.ojt12.cybersquad.dto.UserDto;
import com.ojt12.cybersquad.model.*;
import com.ojt12.cybersquad.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comment")
public class CommentController {
    @Autowired
    CommentService commentService;
    @Autowired
    ReplyService replyService;
    @Autowired
    UserService userService;
    @Autowired
    ContentService contentService;
    @Autowired
    NotificationService notificationService;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    ShareService shareService;

    @MessageMapping("/send-comment")
    public void handleComment(CommentDto comment, Principal principal) {
        // Handle the received comment message
        System.out.println("Received comment: " + comment.getContentId() + " by user: " + comment.getUserId() + " - " + comment.getComment());

        Comment savedCom= commentService.saveComment(comment);
        Optional<Content> contentOptional = contentService.findContentById(comment.getContentId());
        comment.setId(savedCom.getId());
        comment.setTime(savedCom.getTime());
        User user= userService.findByStaffId(principal.getName());
        String message = user.getName()+" commented on your post";
        if (contentOptional.isPresent()) {
            Content content = contentOptional.get();
            int ownerId = content.getUser().getId();
            if (comment.getUserId() != ownerId) {
                notificationService.sendCommentNotification(ownerId, message, content,user.getPhoto());
            }
            messagingTemplate.convertAndSend("/user/public/" + comment.getContentId(), comment);
            // Extract and notify mentioned users
            List<String> mentionedUsernames = commentService.extractMentions(comment.getComment());
            for (String username : mentionedUsernames) {
                User mentionedUser = userService.findByName(username);
                if (mentionedUser != null) {
                    System.out.println("Mentioned user found: " + mentionedUser.getName());
                } else {
                    System.out.println("Mentioned user not found for username: " + username);
                }
                if (mentionedUser != null) {
                    String mentionMessage = user.getName() + " mentioned you in a comment";
                    notificationService.sendMentionNotification(mentionedUser.getId(), mentionMessage, content, user.getPhoto());
                }
            }
        } else {
            System.out.println("Content not found for Id: " + comment.getContentId());
        }

    }

    @GetMapping("/{contentId}")
    public ResponseEntity<List<CommentDto>> getCommentsByContentId(@PathVariable int contentId) {
        List<CommentDto> comments = commentService.getCommentsByContentId(contentId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/{contentId}/comment-count")
    public ResponseEntity<Integer> getCommentCountByContentId(@PathVariable int contentId) {
        int commentCount = commentService.getCommentCountByContentId(contentId);
        return ResponseEntity.ok(commentCount);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<String> editComment(@PathVariable int commentId, @RequestBody CommentDto commentDto, Principal principal) {
        // Retrieve comment by ID
        Comment comment = commentService.findCommentById(commentId);
        User user = userService.findByStaffId(principal.getName());
        if (comment == null) {
            return ResponseEntity.notFound().build();
        }
        if (!comment.getUser().getName().equals(user.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have permission to edit this comment.");
        }

        comment.setComment(commentDto.getComment());
        commentService.save(comment);

        return ResponseEntity.ok("Comment updated successfully");
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<String> deleteComment(@PathVariable int commentId, Principal principal) {
        // Retrieve comment by ID
        Comment comment = commentService.findCommentById(commentId);
        User user = userService.findByStaffId(principal.getName());
        if (comment == null) {
            return ResponseEntity.notFound().build();
        }
        if (!comment.getUser().getName().equals(user.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have permission to delete this comment.");
        }
        List<Reply> replies = replyService.findRepliesByCommentId(commentId);

        // Delete each reply
        for (Reply reply : replies) {
            replyService.deleteReply(reply.getId());
        }
        commentService.deleteComment(commentId);

        return ResponseEntity.ok("Comment deleted successfully");
    }

    @PostMapping("/{commentId}/like")
    public ResponseEntity<Void> likeComment(@PathVariable int commentId, @RequestParam int userId) {
        User user = userService.getUserById(userId);
        String message = user.getName() + " liked your comment";
        String photo = user.getPhoto();
        Comment commentUser = commentService.findCommentById(commentId);
        Content content = commentUser.getContent();
        int ownerId = commentUser.getUser().getId();
        Notification savedNoti = notificationService.save(ownerId,message,content,photo);
        NotificationDto dto = new NotificationDto();
        dto.setId(savedNoti.getId());
        dto.setOwnerId(savedNoti.getOwnerId());
        dto.setMessage(savedNoti.getMessage());
        dto.setContentId(String.valueOf(savedNoti.getContent().getId()));
        dto.setPhoto(savedNoti.getPhoto());
        dto.setTime(savedNoti.getTime());
        if(user.getId()!=ownerId){
            messagingTemplate.convertAndSendToUser(String.valueOf(ownerId), "/private-message", dto);
        }

        commentService.likeComment(commentId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/{commentId}/unlike")
    public ResponseEntity<Void> unlikeComment(@PathVariable int commentId) {

        commentService.unlikeComment(commentId);

        return ResponseEntity.ok().build();
    }

    @MessageMapping("/send-comment-share")
    public void handleCommentShare(CommentDto comment, Principal principal) {
        // Handle the received comment message
        System.out.println("Received comment: " + comment.getShareId() + " by user: " + comment.getUserId() + " - " + comment.getComment());
        Comment savedCom= commentService.saveShareComment(comment);
        Optional<Share> shareOptional = shareService.findShareById(comment.getShareId());
        comment.setId(savedCom.getId());
        comment.setTime(savedCom.getTime());
        User user= userService.findByStaffId(principal.getName());
        String message = user.getName()+" commented on your post";
        if (shareOptional.isPresent()) {
            Share share = shareOptional.get();
            int ownerId = share.getShareUserId();
            if (comment.getUserId() != ownerId) {
                notificationService.sendShareCommentNotification(ownerId, message, share,user.getPhoto());
            }
            messagingTemplate.convertAndSend("/user/sharedComment/" + comment.getShareId(), comment);
        } else {
            System.out.println("Content not found for Id: " + comment.getContentId());
        }

    }

    @GetMapping("/share/{shareId}")
    public ResponseEntity<List<CommentDto>> getCommentsByShareId(@PathVariable int shareId) {
        List<CommentDto> comments = commentService.getCommentsByShareId(shareId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/{shareId}/comment-count-share")
    public ResponseEntity<Integer> getCommentCountByShareId(@PathVariable int shareId) {
        int commentCount = commentService.getCommentCountByShareId(shareId);
        return ResponseEntity.ok(commentCount);
    }

    @PostMapping("/{commentId}/like-share-comment")
    public ResponseEntity<Void> likeShareComment(@PathVariable int commentId, @RequestParam int userId) {
        User user = userService.getUserById(userId);
        String message = user.getName() + " liked your comment";
        String photo = user.getPhoto();
        Comment commentUser = commentService.findCommentById(commentId);
        Share share = commentUser.getShare();
        int ownerId = commentUser.getUser().getId();
        Notification savedNoti = notificationService.saveShareNoti(ownerId,message,share,photo);
        NotificationDto dto = new NotificationDto();
        dto.setId(savedNoti.getId());
        dto.setOwnerId(savedNoti.getOwnerId());
        dto.setMessage(savedNoti.getMessage());
        dto.setShareId(String.valueOf(savedNoti.getShare().getId()));
        dto.setPhoto(savedNoti.getPhoto());
        dto.setTime(savedNoti.getTime());
        if(user.getId()!=ownerId){
            messagingTemplate.convertAndSendToUser(String.valueOf(ownerId), "/private-message", dto);
        }

        commentService.likeComment(commentId);
        return ResponseEntity.ok().build();
    }
}
