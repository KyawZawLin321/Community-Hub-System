package com.ojt12.cybersquad.repository;

import com.ojt12.cybersquad.model.Remark;
import com.ojt12.cybersquad.model.Share;
import com.ojt12.cybersquad.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RemarkRepository extends JpaRepository<Remark, Integer> {
    @Query("SELECT COUNT(r) FROM Remark r WHERE r.content.id = :contentId AND r.likes = true")
    int countLikesByContentId(int contentId);

    List<Remark> findCommentsByContentId(int contentId);

    /*STRM*/

    @Query("SELECT COUNT(r) FROM Remark r WHERE r.content.user.id = :userId AND r.likes = true")
    int countLikesByUserId(@Param("userId") int userId);


    @Query(value = "SELECT COUNT(*) AS likeCountWithinOneWeek " +
            "FROM Remark " +
            "WHERE time BETWEEN DATE_SUB(NOW(), INTERVAL 1 WEEK) AND NOW() " +
            "AND user_id = :userId " +
            "AND likes = true",
            nativeQuery = true)
    int countLikeWithinOneWeek(int userId);

    @Query("SELECT FUNCTION('DAYNAME', r.time), COUNT(r) FROM Remark r WHERE r.content.user.id = :userId AND r.likes = true GROUP BY FUNCTION('DAYNAME', r.time)")
    List<Object[]> countLikesByDayOfWeek(@Param("userId") int userId);


    Optional<Remark> findByShareAndUser(Share share, User user);

    /*STRM*/






}
