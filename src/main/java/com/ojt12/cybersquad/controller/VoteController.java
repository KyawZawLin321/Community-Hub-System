package com.ojt12.cybersquad.controller;


import com.ojt12.cybersquad.dto.VoteRequestDTO;
import com.ojt12.cybersquad.model.OptionList;
import com.ojt12.cybersquad.model.Poll;
import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.model.Vote;
import com.ojt12.cybersquad.repository.OptionListRepository;
import com.ojt12.cybersquad.repository.PollRepository;
import com.ojt12.cybersquad.repository.UserRepository;
import com.ojt12.cybersquad.repository.VoteRepository;
import com.ojt12.cybersquad.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class VoteController {
    private final PollRepository pollRepository;
    private final OptionListRepository optionListRepository;
    private final VoteRepository voteRepository;
    private final UserService userService;
    private final UserRepository userRepository;
// kym vote create //
    @PostMapping("/createVote")
    public ResponseEntity<Map<String, String>> createVote(@RequestBody VoteRequestDTO voteRequest) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Vote Created Successfully");

        String staffId = SecurityContextHolder.getContext().getAuthentication().getName();
        User userExist = userService.findByStaffId(staffId);

        // Extract data from the request
        int optionId = voteRequest.getOptionId();
        int pollId = voteRequest.getPollId();

        // Find the user and poll based on IDs
        Optional<Poll> optionalPoll = pollRepository.findById(pollId);
        if (optionalPoll.isPresent()) {
            Poll poll = optionalPoll.get();

            // Check if the user has already voted in this poll
            Optional<Vote> optionalPreviousVote = voteRepository.findByUserAndPoll(userExist, poll);
            if (optionalPreviousVote.isPresent()) {
                // Delete the previous vote
                Vote previousVote = optionalPreviousVote.get();
                voteRepository.delete(previousVote);
            }

            // Find the option based on ID
            Optional<OptionList> optionalOption = optionListRepository.findById(optionId);
            if (optionalOption.isPresent()) {
                OptionList option = optionalOption.get();

                // Create a new vote
                Vote newVote = new Vote();
                newVote.setNum(1); // Set the vote count as needed
                newVote.setUser(userExist);
                newVote.setOptionList(option);

                // Save the new vote
                voteRepository.save(newVote);
            } else {
                // Handle case when the option is not found
                response.put("message", "Failed to create vote. Option not found.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } else {
            // Handle case when the poll is not found
            response.put("message", "Failed to create vote. Poll not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
    @GetMapping("/voters/{optionId}")
    public ResponseEntity<List<Map<String, String>>> getVotersForPoll(@PathVariable int optionId) {
        List<User> users = userRepository.findUsersByOptionId(optionId);
        if (users.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Simplify the user data by creating a new list of simplified User DTOs
        List<Map<String, String>> simplifiedUsers = users.stream().map(user -> {
            Map<String, String> userMap = new HashMap<>();
            userMap.put("id", String.valueOf(user.getId()));
            userMap.put("name", user.getName());
            userMap.put("email", user.getEmail());
            userMap.put("photo", user.getPhoto());
            userMap.put("staffId", user.getStaffId());

            // Add other necessary fields...
            return userMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(simplifiedUsers);
    }


}
// kym vote create //