package com.ojt12.cybersquad.repository;

import com.ojt12.cybersquad.model.OptionList;
import com.ojt12.cybersquad.model.Poll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface OptionListRepository extends JpaRepository<OptionList,Integer>, JpaSpecificationExecutor<OptionList> {
    List<OptionList> findByPoll(Poll poll);

    List<OptionList> findAllByPollId(int id);
}
