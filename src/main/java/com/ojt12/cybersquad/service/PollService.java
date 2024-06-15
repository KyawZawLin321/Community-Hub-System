package com.ojt12.cybersquad.service;

import com.ojt12.cybersquad.model.Content;
import com.ojt12.cybersquad.model.OptionList;
import com.ojt12.cybersquad.model.Poll;
import com.ojt12.cybersquad.repository.PollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PollService {
    @Autowired
    PollRepository pollRepository;

    public Poll save(Poll poll) {
        pollRepository.save(poll);
        return poll;
    }

    public List<Poll> findAll() {
        return pollRepository.findAll();
    }



}

