package com.ojt12.cybersquad.repository;

import com.ojt12.cybersquad.model.Content;
import com.ojt12.cybersquad.model.Poll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PollRepository extends JpaRepository<Poll,Integer>, JpaSpecificationExecutor<Poll> {

    @Query("SELECT p FROM Poll p WHERE p.user.id = :userId AND p.status = true")
    List<Poll> poll1(@Param("userId") int userId);

    @Query("SELECT p FROM Poll p WHERE p.groups.id = :groupId and p.status = true")
    List<Poll> groupPoll(@Param("groupId")int groupId);

    @Query("SELECT p FROM  Poll p WHERE p.user.id = :userId AND p.status = true AND p.groups.id is null")
    List<Poll> userPollFeed(int userId);

    @Query("SELECT p FROM Poll p WHERE p.groups IS NULL AND p.status = true AND p.isPublic = :public1")
    List<Poll> newPollFeed(@Param("public1") String public1);

}
