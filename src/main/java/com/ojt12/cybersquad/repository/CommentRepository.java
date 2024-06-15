package com.ojt12.cybersquad.repository;

import com.ojt12.cybersquad.model.Comment;
import com.ojt12.cybersquad.model.Remark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {

    @Query("SELECT COUNT(c) FROM Comment c WHERE c.content.id = :contentId")
    int countCommentsByContentId(@Param("contentId") int contentId);
    List<Comment> findCommentsByContentId(int contentId);

    @Query("SELECT COUNT(s) FROM Comment s INNER JOIN s.content c WHERE c.user.id = :userId")
    int countCommentsByUserId(@Param("userId") int userId);
    
    Comment findCommentsByUserId(int userId);



    List<Comment> findCommentsByShareId(int shareId);

    int countCommentsByShareId(int shareId);


    /*testing*/
   /* @Query(value = "SELECT COUNT(*) AS commentCountWithinOneWeek " +
            "FROM comments " +
            "WHERE time BETWEEN DATE_SUB(NOW(), INTERVAL 1 WEEK) AND NOW() " +
            "AND user_id = :userId",
            nativeQuery = true)*/


    @Query(value = "SELECT COUNT(*) AS commentCountWithinOneWeek " +
            "FROM comments " +
            "WHERE time BETWEEN DATE_SUB(NOW(), INTERVAL 1 WEEK) AND NOW() " +
            "AND user_id = :userId " ,
            nativeQuery = true)
    int countCommentWithinOneWeek(@Param("userId") int userId);

    @Query("SELECT FUNCTION('DAYNAME', c.time), COUNT(c) FROM Comment c WHERE c.content.user.id = :userId GROUP BY FUNCTION('DAYNAME', c.time)")
    List<Object[]> countCommentsByDayOfWeek(@Param("userId") int userId);



}
