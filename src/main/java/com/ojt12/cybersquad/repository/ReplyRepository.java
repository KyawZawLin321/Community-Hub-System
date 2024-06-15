package com.ojt12.cybersquad.repository;

import com.ojt12.cybersquad.model.Comment;
import com.ojt12.cybersquad.model.Reply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReplyRepository extends JpaRepository<Reply, Integer> {
    List<Reply> findRepliesByContentIdAndCommentId(int contentId, int commentId);
    int countRepliesByContentIdAndCommentId(int contentId, int commentId);

    List<Reply> findRepliesByCommentId(int commentId);

    Reply findReplyById(int replyId);
        List<Reply> findRepliesByShareIdAndCommentId(int shareId, int commentId);

    int countRepliesByShareIdAndCommentId(int shareId, int commentId);


}
