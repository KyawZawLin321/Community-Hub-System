package com.ojt12.cybersquad.repository;

import com.ojt12.cybersquad.model.OptionList;
import com.ojt12.cybersquad.model.Poll;
import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


// kym //

@Repository
public interface VoteRepository extends JpaRepository<Vote,Integer>, JpaSpecificationExecutor<Vote> {

//    boolean existsByUserAndOptionList(User user, OptionList optionList);


    @Query("SELECT v FROM Vote v WHERE v.user = :user AND v.optionList.poll = :poll")
    Optional<Vote> findByUserAndPoll(@Param("user") User user, @Param("poll") Poll poll);

    List<Vote> findByOptionList(OptionList optionList);


}
// kym //