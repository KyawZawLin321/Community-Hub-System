package com.ojt12.cybersquad.service;

import com.ojt12.cybersquad.model.OptionList;
import com.ojt12.cybersquad.model.Vote;
import com.ojt12.cybersquad.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VoteService {


    @Autowired
    private VoteRepository voteRepository;

    public List<Vote> findByOptionList(OptionList optionList) {
        return voteRepository.findByOptionList(optionList);
    }
}
