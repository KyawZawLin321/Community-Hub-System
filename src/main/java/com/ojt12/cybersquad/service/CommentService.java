package com.ojt12.cybersquad.service;

import com.ojt12.cybersquad.dto.CommentDto;
import com.ojt12.cybersquad.model.*;
import com.ojt12.cybersquad.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CommentService {
    @Autowired
    CommentRepository commentRepository;
    @Autowired
    UserService userService;
    @Autowired
    ContentService contentService;
    @Autowired
    ShareService shareService;
    public List<CommentDto> getCommentsByContentId(int contentId) {
        List<Comment> comments = commentRepository.findCommentsByContentId(contentId);
        List<CommentDto> commentDtoList = new ArrayList<>();

        for (Comment comment : comments) {
            CommentDto commentDto = new CommentDto();
            commentDto.setId(comment.getId());
            commentDto.setTime(comment.getTime());
            commentDto.setUserId(comment.getUser().getId());
            commentDto.setContentId(comment.getContent().getId());
            commentDto.setComment(comment.getComment());
            commentDtoList.add(commentDto);
        }

        return commentDtoList;
    }

    public Comment saveComment(CommentDto commentDto) {
        Comment comment = new Comment();
        comment.setComment(commentDto.getComment());
        comment.setTime(LocalDateTime.now());
        Optional<User> userOptional = userService.findUserById(commentDto.getUserId());
        Optional<Content> contentOptional = contentService.findContentById(commentDto.getContentId());

        if (userOptional.isPresent() && contentOptional.isPresent()) {
            User user = userOptional.get();
            Content content = contentOptional.get();

            comment.setUser(user);
            comment.setContent(content);

            commentRepository.save(comment);
        } else {
            // Handle the case where User or Content is not found
            // You may throw an exception, log a message, or handle it based on your application logic
        }
        return comment;
    }

    public int getCommentCountByContentId(int contentId) {
        return commentRepository.countCommentsByContentId(contentId);
    }

    public Comment findCommentById(int commentId) {
        Optional<Comment> commentOptional = commentRepository.findById(commentId);

            return commentOptional.get();

    }

    public void deleteComment(int commentId) {
        commentRepository.deleteById(commentId);
    }

    public void save(Comment comment) {
        commentRepository.save(comment);
    }

    /*STRM*/

    public int countCommentsByUserId(int id) {
        return commentRepository.countCommentsByUserId(id);
    }

    public int countCommentsByContentId(int contentId) {
        return commentRepository.countCommentsByContentId(contentId);
    }

    /*STRM*/


    public Comment getCommentsByUserId(int userId) {
        return commentRepository.findCommentsByUserId(userId);
    }

    public void unlikeComment(int commentId) {
        Optional<Comment> optionalComment= commentRepository.findById(commentId);
        if (optionalComment.isPresent()) {
            Comment comment = optionalComment.get();

            comment.setLiked(false);
            // Save the updated reply
            commentRepository.save(comment);
        } else {
            System.out.println("Reply not found with id: " + commentId);
        }
    }

    public void likeComment(int commentId) {
        Optional<Comment> optionalComment= commentRepository.findById(commentId);
        if (optionalComment.isPresent()) {
            Comment comment = optionalComment.get();

            comment.setLiked(true);
            // Save the updated reply
            commentRepository.save(comment);
        } else {
            System.out.println("Reply not found with id: " + commentId);
        }
    }

    /*STRM*/
    public int getCommentCountWithinOneWeek(int userId) {
        try {
            int count = commentRepository.countCommentWithinOneWeek(userId);
            System.out.println("Comment count within one week for user " + userId + ": " + count);
            return count;
        } catch (Exception e) {
            System.err.println("Error counting content within one week for user " + userId + ": " + e.getMessage());
            throw e;
        }
    }
    public Map<String, Integer> countCommentsByDayOfWeek(int userId) {
        List<Object[]> results = commentRepository.countCommentsByDayOfWeek(userId);
        Map<String, Integer> commentsByDay = new HashMap<>();
        for (Object[] result : results) {
            String day = (String) result[0];
            int count = ((Number) result[1]).intValue();
            commentsByDay.put(day, count);
        }
        return commentsByDay;
    }

    public Comment saveShareComment(CommentDto comment) {
        Comment commentShare = new Comment();
        commentShare.setComment(comment.getComment());
        commentShare.setTime(LocalDateTime.now());
        Optional<User> userOptional = userService.findUserById(comment.getUserId());
        Optional<Share> shareOptional = shareService.findShareById(comment.getShareId());

        if (userOptional.isPresent() && shareOptional.isPresent()) {
            User user = userOptional.get();
            Share share = shareOptional.get();

            commentShare.setUser(user);
            commentShare.setShare(share);

            commentRepository.save(commentShare);
        } else {
            // Handle the case where User or Content is not found
            // You may throw an exception, log a message, or handle it based on your application logic
        }
        return commentShare;
    }

    public List<CommentDto> getCommentsByShareId(int shareId) {
        List<Comment> comments = commentRepository.findCommentsByShareId(shareId);
        List<CommentDto> commentDtoList = new ArrayList<>();

        for (Comment comment : comments) {
            CommentDto commentDto = new CommentDto();
            commentDto.setId(comment.getId());
            commentDto.setTime(comment.getTime());
            commentDto.setUserId(comment.getUser().getId());
            commentDto.setShareId(comment.getShare().getId());
            commentDto.setComment(comment.getComment());
            commentDtoList.add(commentDto);
        }
        return commentDtoList;
    }
    public List<String> extractMentions(String comment) {
        Pattern mentionPattern = Pattern.compile("@([\\w\\s]+?)(?=\\s|$|[^\\w\\s])");
        Matcher matcher = mentionPattern.matcher(comment);
        List<String> mentions = new ArrayList<>();
        while (matcher.find()) {
            if (matcher.group(1) != null) {
                mentions.add(matcher.group(1).trim()); // Extract the mention with space
            } else if (matcher.group(2) != null) {
                mentions.add(matcher.group(2).trim()); // Extract the mention without space
            }
        }
        return mentions;
    }

    public int getCommentCountByShareId(int shareId) {
        return commentRepository.countCommentsByShareId(shareId);
    }


}

    /*STRM*/

