package com.ojt12.cybersquad.service;

import com.ojt12.cybersquad.dto.ReplyDto;
import com.ojt12.cybersquad.model.*;
import com.ojt12.cybersquad.repository.ReplyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ReplyService {

    @Autowired
    UserService userService;
    @Autowired
    ContentService contentService;
    @Autowired
    ShareService shareService;
    @Autowired
    ReplyRepository replyRepository;
    @Autowired
    CommentService commentService;
    public Reply saveReply(ReplyDto replyDto) {
        Reply reply = new Reply();
        reply.setReply(replyDto.getReply());
        reply.setTime(LocalDateTime.now());
        Comment comment = commentService.findCommentById(replyDto.getCommentId());
        if (comment != null) {
            reply.setComment(comment);
        } else {
        }
        Optional<User> userOptional = userService.findUserById(Integer.parseInt(replyDto.getUserId()));
        Optional<Content> contentOptional = contentService.findContentById(replyDto.getContentId());

        if (userOptional.isPresent() && contentOptional.isPresent()) {
            User user = userOptional.get();
            Content content = contentOptional.get();

            reply.setUser(user);
            reply.setContent(content);

            replyRepository.save(reply);
        } else {

        }
        return reply;
    }

    public List<ReplyDto> getCommentsByContentIdAndCommentId(int contentId, int commentId) {
        List<Reply> replies = replyRepository.findRepliesByContentIdAndCommentId(contentId,commentId);
        List<ReplyDto> replyDtoList = new ArrayList<>();

        for (Reply reply : replies) {
            ReplyDto replyDto = new ReplyDto();
            replyDto.setId(reply.getId());
            replyDto.setCommentId(reply.getComment().getId());
            replyDto.setUserId(String.valueOf(reply.getUser().getId()));
            replyDto.setContentId(reply.getContent().getId());
            replyDto.setReply(reply.getReply());
            replyDto.setTime(reply.getTime());
            replyDtoList.add(replyDto);
        }

        return replyDtoList;
    }

    public int getReplyCountByContentIdAndCommentId(int contentId, int commentId) {
        return replyRepository.countRepliesByContentIdAndCommentId(contentId,commentId);
    }

    public List<Reply> findRepliesByCommentId(int commentId) {
        return replyRepository.findRepliesByCommentId(commentId);
    }

    public void deleteReply(int id) {
        replyRepository.deleteById(id);
    }

    public void save(Reply reply) {
        replyRepository.save(reply);
    }

    public Optional<Reply> findRepliesById(int replyId) {
        return replyRepository.findById(replyId);
    }

    public Reply findReplyById(int replyId) {
        return replyRepository.findReplyById(replyId);
    }

    public void likeReply(int replyId) {
        Optional<Reply> optionalReply = replyRepository.findById(replyId);
        if (optionalReply.isPresent()) {
            Reply reply = optionalReply.get();

            reply.setLiked(true);
            // Save the updated reply
            replyRepository.save(reply);
        } else {
            System.out.println("Reply not found with id: " + replyId);
        }
    }

    public void unlikeReply(int replyId) {
        Optional<Reply> optionalReply = replyRepository.findById(replyId);
        if (optionalReply.isPresent()) {
            Reply reply = optionalReply.get();

            reply.setLiked(false);
            // Save the updated reply
            replyRepository.save(reply);
        } else {
            System.out.println("Reply not found with id: " + replyId);
        }
    }

    public Reply saveReplyShare(ReplyDto replyDto) {
        Reply reply = new Reply();
        reply.setReply(replyDto.getReply());
        reply.setTime(LocalDateTime.now());
        Comment comment = commentService.findCommentById(replyDto.getCommentId());
        if (comment != null) {
            reply.setComment(comment);
        } else {
        }
        Optional<User> userOptional = userService.findUserById(Integer.parseInt(replyDto.getUserId()));
        Optional<Share> shareOptional = shareService.findShareById(replyDto.getShareId());

        if (userOptional.isPresent() && shareOptional.isPresent()) {
            User user = userOptional.get();
            Share share = shareOptional.get();

            reply.setUser(user);
            reply.setShare(share);

            replyRepository.save(reply);
        } else {

        }
        return reply;
    }

    public List<ReplyDto> getCommentsByShareIdAndCommentId(int shareId, int commentId) {
        List<Reply> replies = replyRepository.findRepliesByShareIdAndCommentId(shareId,commentId);
        List<ReplyDto> replyDtoList = new ArrayList<>();

        for (Reply reply : replies) {
            ReplyDto replyDto = new ReplyDto();
            replyDto.setId(reply.getId());
            replyDto.setCommentId(reply.getComment().getId());
            replyDto.setUserId(String.valueOf(reply.getUser().getId()));
            replyDto.setShareId(reply.getShare().getId());
            replyDto.setReply(reply.getReply());
            replyDto.setTime(reply.getTime());
            replyDtoList.add(replyDto);
        }

        return replyDtoList;
    }

    public int getReplyCountByShareIdAndCommentId(int shareId, int commentId) {
        return replyRepository.countRepliesByShareIdAndCommentId(shareId,commentId);
    }

}
