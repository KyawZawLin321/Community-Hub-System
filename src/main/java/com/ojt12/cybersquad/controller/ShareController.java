package com.ojt12.cybersquad.controller;

import com.ojt12.cybersquad.dto.UserDto;
import com.ojt12.cybersquad.model.*;
import com.ojt12.cybersquad.repository.*;
import com.ojt12.cybersquad.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


// kym //
@RestController
@RequiredArgsConstructor
public class ShareController {
    private final ShareService shareService;
    private final ContentRepository contentRepository;
    private final GroupRepository groupRepository;
    private final CloudinaryImgService cloudinaryImgService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final ShareRepository shareRepository;
    private final RemarkService remarkService;
    private final NotificationService notificationService;

// share list for new feed //
@GetMapping("/shares")
public ResponseEntity<List<Share>> newFeedOfShare(Model model) {
    String publicStatus = "public";
    List<Share> shareList = shareRepository.newFeed(publicStatus);
    shareList.forEach(share -> share.setUserId(share.getUser().getId()));
    shareList.forEach(content -> content.setContentId(content.getContent().getId()));

    shareList.forEach(share -> {
        if (share.getGroups() != null) {
            share.setGroupId(share.getGroups().getId());
        } else {
            share.setGroupId(0); // or any other appropriate default value
        }
    });
    return ResponseEntity.status(HttpStatus.OK).body(shareList);
}

// share list for group feed with group id//
    @GetMapping("/groupShares/{groupId}")
    public ResponseEntity<List<Share>> groupFeedOfShare(@PathVariable("groupId") int groupId,Model model) {

        List<Share> shareList = shareRepository.groupFeed(groupId);
        shareList.forEach(share -> share.setUserId(share.getUser().getId()));
        shareList.forEach(content -> content.setContentId(content.getContent().getId()));

        shareList.forEach(share -> {
            if (share.getGroups() != null) {
                share.setGroupId(share.getGroups().getId());
            } else {
                share.setGroupId(0); // or any other appropriate default value
            }
        });
        return ResponseEntity.status(HttpStatus.OK).body(shareList);
    }

    // share list for user feed  with user id //
    @GetMapping("/userShares")
    public ResponseEntity<List<Share>> userFeedOfShare() {

        String staffId= SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userService.findByStaffId(staffId);
        int userId = user.getId();

        List<Share> shareList = shareRepository.userFeed(userId);

        shareList.forEach(share -> share.setUserId(share.getUser().getId()));

        shareList.forEach(content -> content.setContentId(content.getContent().getId()));

        return ResponseEntity.status(HttpStatus.OK).body(shareList);
    }
    @GetMapping("/trash-share")
    public ResponseEntity<List<Share>> trashShares() {

        String staffId= SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userService.findByStaffId(staffId);
        int userId = user.getId();

        List<Share> shareList = shareRepository.trash(userId);

        shareList.forEach(share -> share.setUserId(share.getUser().getId()));

        shareList.forEach(content -> content.setContentId(content.getContent().getId()));

        return ResponseEntity.status(HttpStatus.OK).body(shareList);
    }
    @GetMapping("/searchShare/{id}")
    public ResponseEntity<List<Share>> searchProfileShare(@PathVariable int id) {

        User user=userService.findById(id).orElse(null);
        int userId = user.getId();

        List<Share> shareList = shareRepository.userFeed(userId);

        shareList.forEach(share -> share.setUserId(share.getUser().getId()));

        shareList.forEach(content -> content.setContentId(content.getContent().getId()));

        return ResponseEntity.status(HttpStatus.OK).body(shareList);
    }

    // kym share create //
    @PostMapping("/createShare")
    public ResponseEntity<Map<String, String>> createShare(@RequestParam("caption") String caption,
                                                             @RequestParam("share") int share,
                                                             @RequestParam("contentId") Content contentId,
                                                           @RequestParam("isPublic") String  isPublic,
                                                           @RequestParam("groupId") int  groupId,
                                                           @RequestParam("userId") User userId){
        Map<String, String> response = new HashMap<>();
        response.put("message", "Created Successfully");
        String staffId = SecurityContextHolder.getContext().getAuthentication().getName();
        User userExist = userService.findByStaffId(staffId);
        int nowUser = userExist.getId();

        Groups groups=groupRepository.findGroupsById(groupId);

        System.out.println("Content ID: " + contentId);
        System.out.println("User ID: " + userId);

        Share share1 = new Share();
        share1.setCaption(caption);
        share1.setShare(share);
        share1.setShareUserId(nowUser);
        share1.setTime(LocalDateTime.now());
        share1.setContent(contentId);
        share1.setIsPublic(isPublic);
        share1.setStatus(true);
        share1.setUser(userId);
        share1.setGroups(groups);
        shareRepository.save(share1);
        //swm
        String photo = userExist.getPhoto();
        String ownerId = String.valueOf(share1.getContent().getUser().getId());
        String message = userExist.getName()+ " shared your post: " + share1.getContent().getText();
        if(!String.valueOf(userExist.getId()).equals(ownerId)){
            notificationService.sendPrivateNotification(ownerId,message,share1.getContent(),photo);
        }

        //swm
        // Handle mentions
        List<String> mentionedUsernames = extractMentions(share1.getCaption());
        for (String username : mentionedUsernames) {
            User mentionedUser = userService.findByName(username.replaceAll("\\s", ""));
            if (mentionedUser != null) {
                String mentionMessage = userExist.getName() + " mentioned you in a shared post";
                notificationService.sendMentionSharedNotification(mentionedUser.getId(), mentionMessage, share1, userExist.getPhoto());
            }
        }

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
    public List<String> extractMentions(String text) {
        Pattern mentionPattern = Pattern.compile("@([\\w\\s]+?)(?=\\s|$|[^\\w\\s])");
        Matcher matcher = mentionPattern.matcher(text);
        List<String> mentions = new ArrayList<>();
        while (matcher.find()) {
            mentions.add(matcher.group(1).trim());
        }
        return mentions;
    }
// share count with content id //

    @GetMapping("/shareCount/{contentId}")
    public ResponseEntity<Map<String, Integer>> getShareCountByContentId(@PathVariable int contentId) {
        int count = shareService.countSharesByContentId(contentId);
        Map<String, Integer> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


//    @GetMapping("/shareCount1/{contentId}")
//    public ResponseEntity<Map<String, Integer>> getShareCountByContentId1(@PathVariable int contentId) {
//        int count = shareService.countSharesByContentId1(contentId);
//        Map<String, Integer> response = new HashMap<>();
//        response.put("count", count);
//        return ResponseEntity.status(HttpStatus.OK).body(response);
//    }

    // kym share update //
    @PutMapping("/updateShare")
    public ResponseEntity<Map<String, String>> shareUpdate(@RequestParam("id") int id,
                                                           @RequestParam("caption") String caption,
                                                           @RequestParam("shareUserId") int shareUserId,
                                                           @RequestParam("contentId") int contentId,
                                                           @RequestParam("isPublic1") String isPublic1,
                                                           @RequestParam("groupId") int  groupId,
                                                           @RequestParam("userId") int userId) {

    Map<String, String> response = new HashMap<>();
        response.put("message", "Update successful");

        try {
            // Retrieve content and user objects based on IDs
            Content content = contentRepository.findById(contentId).orElse(null);
            User user = userRepository.findById(userId).orElse(null);
            Groups groups=groupRepository.findGroupsById(groupId);


            if (content != null && user != null) {
                // Update share object
                Share share = shareRepository.findById(id).orElse(null);
                if (share != null) {
                    share.setCaption(caption);
                    share.setShareUserId(shareUserId);
                    share.setContent(content);
                    share.setIsPublic(isPublic1);
                    share.setUser(user);
                    share.setUpdatedDate(LocalDateTime.now());
                    share.setGroups(groups);

                    // Save the updated share object
                    shareRepository.save(share);

                    // Return success response
                    return ResponseEntity.status(HttpStatus.OK).body(response);
                } else {
                    response.put("message", "Share not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                }
            } else {
                response.put("message", "Content or User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("message", "Failed to update content");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // delete share //
    @PutMapping("/deleteShare/{id}")
    public ResponseEntity<?> deleteShare(@PathVariable("id") int id) {
        Optional<Share> optionalShare = shareRepository.findById(id);
        if (optionalShare.isPresent()) {
            Share share = optionalShare.get();

            share.setStatus(false); // Set status to false instead of deleting
            shareRepository.save(share); // Save the updated content entity
            System.out.println("is ok");
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Content not found", HttpStatus.NOT_FOUND);
        }
    }


    @PostMapping("/api/share/{shareId}/like-share")
  public ResponseEntity<String> likeShare(@PathVariable int shareId) {
    try {
        String staffId = SecurityContextHolder.getContext().getAuthentication().getName();
        User userFetched = userService.findByStaffId(staffId);
        boolean likedShare = remarkService.likeShare(shareId, userFetched);
        return ResponseEntity.ok(likedShare ? "Share liked successfully." : "Share disliked successfully.");
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to like share: " + e.getMessage());
    }
}

    @GetMapping("/api/share/{shareId}/like-count-share")
    public ResponseEntity<Map<String, Integer>> getLikeCountShare(@PathVariable int shareId) {
        int likeCountShare = remarkService.getShareLikeCount(shareId);
        Map<String, Integer> response = new HashMap<>();
        response.put("likeCountShare", likeCountShare);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/share/{shareId}/like-status")
    public ResponseEntity<Map<String, Boolean>> getLikeStatusShare(@PathVariable int shareId) {
        String staffId = SecurityContextHolder.getContext().getAuthentication().getName();
        User userFetched = userService.findByStaffId(staffId);
        boolean likedShare = remarkService.isUserLikedShare(shareId, userFetched);
        Map<String, Boolean> response = new HashMap<>();
        response.put("likedShare", likedShare);
        return ResponseEntity.ok(response);
    }


}
//kym//