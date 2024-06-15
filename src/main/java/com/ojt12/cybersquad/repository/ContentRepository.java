package com.ojt12.cybersquad.repository;

import com.ojt12.cybersquad.model.Content;
import com.ojt12.cybersquad.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

// kym //
@Repository
public interface ContentRepository extends JpaRepository<Content,Integer>, JpaSpecificationExecutor<Content> {

//    @Query("SELECT c FROM Content c WHERE c.groups IS NULL AND c.status = true AND c.isPublic = :public1")
//    List<Content> newFeed();

      @Query("SELECT c FROM Content c WHERE c.groups IS NULL AND c.status = true AND c.isPublic = :publicStatus")
      List<Content> newFeed(@Param("publicStatus") String publicStatus);


    @Query("SELECT c FROM Content c WHERE c.groups.id = :groupId and c.status = true")
    List<Content> groupFeed(int groupId);

    @Query("SELECT c FROM Content c WHERE c.user.id = :userId AND c.status = true AND c.groups.id is null")
    List<Content> userFeed(int userId);
    @Query("SELECT c FROM Content c WHERE c.user.id = :userId AND c.status = false AND c.groups.id is null")
    List<Content> trash(int userId);
    @Query("SELECT c FROM Content c WHERE c.id = :contentId and c.status = true AND c.isPublic = :publicStatus") // i change 9
    Content findByContentIdForShare(@Param("contentId") int contentId,@Param("publicStatus") String publicStatus);

    @Query("SELECT c FROM Content c WHERE c.user.id = :userId AND c.status = true")
    List<Content> findByUserIdAndStatus(@Param("userId") int userId);


   @Query("SELECT COUNT(c) FROM Content c WHERE c.user.id = :userId AND c.status = true")
    int countContentByUserId(@Param("userId") int userId);

    /*testing*/
   /* @Query(value = "SELECT COUNT(*) AS contentCountWithinOneWeek " +
            "FROM Content " +
            "WHERE created_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 WEEK) AND NOW() " +
            "AND user_id = :userId",
            nativeQuery = true)*/


    @Query(value = "SELECT COUNT(*) AS contentCountWithinOneWeek " +
            "FROM Content " +
            "WHERE created_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 WEEK) AND NOW() " +
            "AND user_id = :userId " +
            "AND status = true",
            nativeQuery = true)
    int countContentWithinOneWeek(@Param("userId") int userId);











    @Query("SELECT c FROM Content c WHERE c.createdDate BETWEEN :startDate AND :endDate")
    List<Content> findAllByCreatedDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    @Query("SELECT c FROM Content c WHERE c.groups.id = :groupId ORDER BY c.createdDate DESC")
    List<Content> findLatestContentByGroupId(@Param("groupId") int groupId, Pageable pageable);


    List<Content> findByStatus(boolean status);

    @Query("SELECT COUNT(c) FROM Content c WHERE c.groups.id = :groupId")
    int countByGroupId(@Param("groupId") Integer groupId);
    @Query("SELECT c.user, COUNT(c) as contentCount FROM Content c WHERE c.groups.id = :groupId GROUP BY c.user ORDER BY contentCount DESC")
    List<Object[]> findUserWithMostContentByGroupId(@Param("groupId") Integer groupId);


}

// kym //



/*oo*/
/*
@Query(value = "SELECT COUNT(*) AS contentCountCurrentWeek " +
        "FROM Content " +
        "WHERE created_date BETWEEN " +
        "DATE_SUB(NOW(), INTERVAL (WEEKDAY(NOW()) + 1) DAY) " +
        "AND DATE_ADD(DATE_SUB(NOW(), INTERVAL (WEEKDAY(NOW()) + 1) DAY), INTERVAL 6 DAY) " +
        "AND user_id = :userId",
        nativeQuery = true)*/
