package com.ojt12.cybersquad.service;

import com.ojt12.cybersquad.dto.CommentDto;
import com.ojt12.cybersquad.model.Content;
import com.ojt12.cybersquad.model.Remark;
import com.ojt12.cybersquad.model.Share;
import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class RemarkService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private RemarkRepository remarkRepository;

    @Autowired
    private ContentRepository contentRepository;
    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private NotificationService notificationService; // Assuming you have a notification service
@Autowired
    private ShareRepository shareRepository;
public boolean likePost(int contentId, User user) {
    Content content = contentRepository.findById(contentId).orElse(null);
    if (content == null) return false;

    Optional<Remark> remarkOptional = content.getRemark().stream()
            .filter(remark -> remark.getUser().equals(user))
            .findFirst();

    Remark remark;
    boolean wasLiked;
    boolean isNowLiked;

    if (remarkOptional.isPresent()) {
        remark = remarkOptional.get();
        wasLiked = remark.isLikes();
        remark.setLikes(!wasLiked);
        remark.setTime(LocalDateTime.now());
        isNowLiked = !wasLiked;
    } else {
        remark = new Remark();
        remark.setContent(content);
        remark.setLikes(true);
        remark.setUser(user);
        remark.setTime(LocalDateTime.now());
        isNowLiked = true;
    }

    remarkRepository.save(remark);

    if (isNowLiked && !content.getUser().equals(user)) {
        String message = user.getName() + " liked your post!";
        notificationService.sendPrivateNotification(String.valueOf(content.getUser().getId()), message, content, user.getPhoto());
    } else if (!isNowLiked) {
        notificationService.removeLikedNotification(content, user);
    }

    return isNowLiked;
}



    public int getLikeCount(int contentId) {
        Content content = contentRepository.findById(contentId).orElse(null);
        if (content == null) return 0;
        return (int) content.getRemark().stream().filter(Remark::isLikes).count();
    }

    public boolean isUserLiked(int contentId, User user) {
        Content content = contentRepository.findById(contentId).orElse(null);
        if (content == null) return false;
        return content.getRemark().stream()
                .anyMatch(remark -> remark.getUser().equals(user) && remark.isLikes());
    }

   public boolean likeShare(int shareId, User user) {
    Share share = shareRepository.findById(shareId).orElse(null);
    if (share == null) {
        throw new IllegalArgumentException("Share not found");
    }

    int initialLikeCount = share.getLikeCount();
    Optional<Remark> userRemarkOptional = remarkRepository.findByShareAndUser(share, user);

    boolean isLiked;

    if (userRemarkOptional.isPresent()) {
        Remark userRemark = userRemarkOptional.get();
        isLiked = !userRemark.isLikes();
        userRemark.setLikes(isLiked);
        userRemark.setTime(LocalDateTime.now());
        remarkRepository.save(userRemark);
    } else {
        Remark newRemark = new Remark();
        //newRemark.setContent(share.getContent());
        newRemark.setLikes(true);
        newRemark.setUser(user);
        newRemark.setTime(LocalDateTime.now());
        newRemark.setShare(share);
        remarkRepository.save(newRemark);
        isLiked = true;
    }

    if (isLiked) {
        share.incrementLikeCount();
    } else {
        share.decrementLikeCount();
    }

    if (isLiked && share.getShareUserId()!=user.getId()) {
        String ownerId = String.valueOf(share.getShareUserId());
        String message = user.getName() + " liked your post!";
        String photo = user.getPhoto();
        notificationService.sendSharePostPrivateNotification(ownerId, message, share, photo);
    } else if (!isLiked) {
        notificationService.removeLikedPostNotification(share, user);
    }

    shareRepository.save(share);
    return isLiked;
}

    public int getShareLikeCount(int shareId) {
        Share share = shareRepository.findById(shareId).orElse(null);
        if (share == null) return 0;
        return share.getLikeCount();
    }

    public boolean isUserLikedShare(int shareId, User user) {
        Share share = shareRepository.findById(shareId).orElse(null);
        if (share == null) return false;
        return remarkRepository.findByShareAndUser(share, user)
                .map(Remark::isLikes)
                .orElse(false);
    }


   


    /*STRM*/

    public int countLikesByUserId(int id) {
        return remarkRepository.countLikesByUserId(id);
    }

    public int countLikesByContentId(int contentId) {
        return remarkRepository.countLikesByContentId(contentId);
    }

    public int getLikeCountWithinOneWeek(int userId) {
        try {
            int count = remarkRepository.countLikeWithinOneWeek(userId);
            System.out.println("Like count within one week for user " + userId + ": " + count);
            return count;
        } catch (Exception e) {
            System.err.println("Error counting content within one week for user " + userId + ": " + e.getMessage());
            throw e;
        }

    }
    public Map<String, Integer> countLikesByDayOfWeek(int userId) {
        List<Object[]> results = remarkRepository.countLikesByDayOfWeek(userId);
        Map<String, Integer> likesByDay = new HashMap<>();
        for (Object[] result : results) {
            String day = (String) result[0];
            int count = ((Number) result[1]).intValue();
            likesByDay.put(day, count);
        }
        return likesByDay;
    }





    /*STRM*/


}

