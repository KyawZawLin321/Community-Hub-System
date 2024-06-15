package com.ojt12.cybersquad.controller;

import com.ojt12.cybersquad.dto.CommentDto;
import com.ojt12.cybersquad.dto.NotificationDto;
import com.ojt12.cybersquad.dto.ReplyDto;
import com.ojt12.cybersquad.model.*;
import com.ojt12.cybersquad.repository.UserRepository;
import com.ojt12.cybersquad.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/reply")
public class ReplyController {
    @Autowired
    ReplyService replyService;
    @Autowired
    UserRepository userService;
    @Autowired
    ContentService contentService;
    @Autowired
    NotificationService notificationService;
    @Autowired
    ShareService shareService;
    @Autowired
    CommentService commentService;
    @Autowired
    UserService serviceUser;
    @Autowired
    SimpMessagingTemplate messagingTemplate;
    @MessageMapping("/send-reply")
    public void handleReply(ReplyDto reply, Principal principal) {
        // Handle the received comment message
        System.out.println("Received reply: " + reply.getUserId() + " - " + reply.getReply()+" CommentId "+reply.getCommentId());
        int ownerId = Integer.parseInt(reply.getUserId());
        Optional<Content> contentOptional = contentService.findContentById(reply.getContentId());
        User user= userService.findByStaffId(principal.getName());
        reply.setUserId(String.valueOf(user.getId()));
        Reply savedReply=replyService.saveReply(reply);
        reply.setId(savedReply.getId());
        reply.setTime(savedReply.getTime());
        String message = user.getName()+" replied to your comment";

        if (contentOptional.isPresent()) {
            Content content = contentOptional.get();

            System.out.println("OwnerId"+ownerId);
            if(!Objects.equals(reply.getUserId(), String.valueOf(ownerId))){
                notificationService.sendReplyNotification(ownerId, message, content,user.getPhoto());
            }

            messagingTemplate.convertAndSend("/user/reply/" + reply.getContentId(), reply);
            // Extract and notify mentioned users
            List<String> mentionedUsernames = commentService.extractMentions(reply.getReply());
            for (String username : mentionedUsernames) {
                User mentionedUser = serviceUser.findByName(username);
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
            System.out.println("Content not found for Id: " + reply.getContentId());
        }


    }
    @GetMapping("/{contentId}/{commentId}")
    public ResponseEntity<List<ReplyDto>> getRepliesByContentId(@PathVariable int contentId,@PathVariable int commentId) {
        List<ReplyDto> replies = replyService.getCommentsByContentIdAndCommentId(contentId,commentId);
        return ResponseEntity.ok(replies);
    }

    @GetMapping("/{contentId}/{commentId}/reply-count")
    public ResponseEntity<Integer> getReplyCountByContentIdAndCommentId(@PathVariable int contentId, @PathVariable int commentId) {
        int commentCount = replyService.getReplyCountByContentIdAndCommentId(contentId,commentId);
        return ResponseEntity.ok(commentCount);
    }
    @GetMapping("/{shareId}/{commentId}/reply-count-share")
    public ResponseEntity<Integer> getReplyCountByShareIdAndCommentId(@PathVariable int shareId, @PathVariable int commentId) {
        int commentCount = replyService.getReplyCountByShareIdAndCommentId(shareId,commentId);
        return ResponseEntity.ok(commentCount);
    }

    @PutMapping("/{replyId}")
    public ResponseEntity<String> editComment(@PathVariable int replyId, @RequestBody ReplyDto replyDto, Principal principal) {
        // Retrieve comment by ID
        Optional<Reply> replyOptional = replyService.findRepliesById(replyId);
        if(replyOptional.isPresent()){
            Reply reply= replyOptional.get();
            User user = userService.findByStaffId(principal.getName());
            if (!reply.getUser().getName().equals(user.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have permission to edit this comment.");
            }

            reply.setReply(replyDto.getReply());
            replyService.save(reply);


        }
        return ResponseEntity.ok("Comment updated successfully");
    }

    @DeleteMapping("/{replyId}")
    public ResponseEntity<String> deleteComment(@PathVariable int replyId, Principal principal) {
        // Retrieve comment by ID
        Optional<Reply> replyOptional = replyService.findRepliesById(replyId);
        if(replyOptional.isPresent()) {
            Reply reply = replyOptional.get();
            User user = userService.findByStaffId(principal.getName());
            if (!reply.getUser().getName().equals(user.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have permission to delete this comment.");
            }

            replyService.deleteReply(replyId);
        }
        return ResponseEntity.ok("Comment deleted successfully");
    }
    @PostMapping("/{replyId}/like")
    public ResponseEntity<Void> likeComment(@PathVariable int replyId, @RequestParam int userId) {
        User user = userService.getUserById(userId);
        String message = user.getName() + " liked your Reply";
        String photo = user.getPhoto();
        Reply commentUser = replyService.findReplyById(replyId);
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

        replyService.likeReply(replyId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/{replyId}/unlike")
    public ResponseEntity<Void> unlikeComment(@PathVariable int replyId) {

        replyService.unlikeReply(replyId);

        return ResponseEntity.ok().build();
    }

    @MessageMapping("/send-reply-share")
    public void handleReplyShare(ReplyDto reply, Principal principal) {
        // Handle the received comment message
        System.out.println("Received reply: " + reply.getUserId() + " - " + reply.getReply()+" CommentId "+reply.getCommentId());
        int ownerId = Integer.parseInt(reply.getUserId());
        Optional<Share> shareOptional = shareService.findShareById(reply.getShareId());
        User user= userService.findByStaffId(principal.getName());
        reply.setUserId(String.valueOf(user.getId()));
        Reply savedReply=replyService.saveReplyShare(reply);
        reply.setId(savedReply.getId());
        reply.setTime(savedReply.getTime());
        String message = user.getName()+" replied to your comment";

        if (shareOptional.isPresent()) {
            Share share = shareOptional.get();

            System.out.println("OwnerId"+ownerId);
            if(!Objects.equals(reply.getUserId(), String.valueOf(ownerId))){
                notificationService.sendShareReplyNotification(ownerId, message, share,user.getPhoto());
            }

            messagingTemplate.convertAndSend("/user/sharedReply/" + reply.getShareId(), reply);
        } else {
            System.out.println("Content not found for Id: " + reply.getContentId());
        }


    }
    @GetMapping("/share/{shareId}/{commentId}")
    public ResponseEntity<List<ReplyDto>> getShareRepliesByContentId(@PathVariable int shareId,@PathVariable int commentId) {
        List<ReplyDto> replies = replyService.getCommentsByShareIdAndCommentId(shareId,commentId);
        return ResponseEntity.ok(replies);
    }

    @PostMapping("/{replyId}/like-share-reply")
    public ResponseEntity<Void> likeShareReply(@PathVariable int replyId, @RequestParam int userId) {
        User user = userService.getUserById(userId);
        String message = user.getName() + " liked your Reply";
        String photo = user.getPhoto();
        Reply commentUser = replyService.findReplyById(replyId);
        Share share = commentUser.getShare();
        int ownerId = commentUser.getUser().getId();

        Notification savedNoti = notificationService.saveShareReply(ownerId,message,share,photo);
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

        replyService.likeReply(replyId);
        return ResponseEntity.ok().build();
    }
}
