package com.ojt12.cybersquad.repository;

import com.ojt12.cybersquad.model.Content;
import com.ojt12.cybersquad.model.Share;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ShareRepository extends JpaRepository<Share, Integer> {

    @Query("SELECT COUNT(s) FROM Share s WHERE s.content.id = :contentId AND s.status = true")
    int countByContentId(@Param("contentId") int contentId);

//    @Query("SELECT COUNT(s) FROM Share s WHERE s.content.id = :contentId AND s.status = true")
//    int countByContentId1(@Param("contentId") int contentId);


    @Query("SELECT COUNT(s) FROM Share s INNER JOIN s.content c WHERE c.user.id = :userId AND s.status = true ")
    int countShareByUserId(@Param("userId") int userId);


    @Query("SELECT s FROM Share s WHERE s.groups.id is null and s.status = true AND s.isPublic = :publicStatus")
    List<Share> newFeed(@Param("publicStatus") String publicStatus);

    @Query("SELECT s FROM Share s WHERE s.groups.id = :groupId and s.status = true")
    List<Share> groupFeed(int groupId);

    @Query("SELECT s FROM Share s WHERE s.shareUserId = :userId and s.status = true and s.groups.id is null")
    List<Share> userFeed(int userId);
    @Query("SELECT s FROM Share s WHERE s.shareUserId = :userId and s.status = false and s.groups.id is null")
    List<Share> trash(int userId);


    @Query(value = "SELECT COUNT(*) AS shareCountWithinOneWeek " +
            "FROM Share " +
            "WHERE time BETWEEN DATE_SUB(NOW(), INTERVAL 1 WEEK) AND NOW() " +
            "AND user_id = :userId " +
            "AND status = true",
            nativeQuery = true)
    int countShareWithinOneWeek(int userId);

    @Query("SELECT FUNCTION('DAYNAME', s.time), COUNT(s) FROM Share s WHERE s.content.user.id = :userId GROUP BY FUNCTION('DAYNAME', s.time)")
    List<Object[]> countSharesByDayOfWeek(@Param("userId") int userId);


}
