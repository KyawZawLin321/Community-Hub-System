package com.ojt12.cybersquad.controller;

import com.ojt12.cybersquad.dto.PollRequestDTO;
import com.ojt12.cybersquad.dto.UpdatePollRequest;
import com.ojt12.cybersquad.model.*;
import com.ojt12.cybersquad.repository.GroupRepository;
import com.ojt12.cybersquad.repository.OptionListRepository;
import com.ojt12.cybersquad.repository.PollRepository;
import com.ojt12.cybersquad.service.OptionListService;
import com.ojt12.cybersquad.service.PollService;
import com.ojt12.cybersquad.service.UserService;
import com.ojt12.cybersquad.service.VoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class PollController {

    private final PollRepository pollRepository;
    private final OptionListRepository optionListRepository;
    private final PollService pollService;
    private final UserService userService;
    private final OptionListService optionListService;
    private final GroupRepository groupRepository;
    private final VoteService voteService;


    // kym poll for newFeed //
    @GetMapping("/polls")
    public ResponseEntity<List<Poll>> newFeedOfPoll() {

        String public1 = "public";

        List<Poll> polls = pollRepository.newPollFeed(public1);

        // Iterate through contentList and handle null groups
        polls.forEach(poll -> {
            if (poll.getGroups() != null) {
                poll.setGroupId(poll.getGroups().getId());
            } else {
                poll.setGroupId(0); // or any other appropriate default value
            }
        });

        // Iterate through contentList and handle null groups
        polls.forEach(poll -> {
            if (poll.getUser() != null) {
                poll.setUserId(poll.getUser().getId());
            }
        });

        polls.forEach(poll -> poll.setUserId(poll.getUser().getId()));

        // Populate option texts for each poll
        // Populate option counts for each poll
        for (Poll poll : polls) {
            poll.setOptionTexts(poll.getOptionList());
            poll.setOptionId(poll.getOptionList());

            // Initialize option counts array
            int[] optionCounts = new int[poll.getOptionList().size()];

            // Calculate option counts
            int index = 0;
            for (OptionList option : poll.getOptionList()) {
                List<Vote> votes = voteService.findByOptionList(option);
                optionCounts[index] = votes.size();
                index++;
            }

            // Set option counts array
            poll.setOptionCounts(optionCounts);

            // Calculate total votes for the poll
            int totalVotes = Arrays.stream(optionCounts).sum();
            poll.setTotalVotes(totalVotes);

            System.out.println("option count: " + Arrays.toString(optionCounts));
            System.out.println("Total count: " + totalVotes);
        }


        return ResponseEntity.status(HttpStatus.OK).body(polls);
    }
// kym newFeed poll end //

// kym groupFeed poll

    @GetMapping("/groupPolls/{groupId}")
    public ResponseEntity<List<Poll>> groupFeedOfPoll(@PathVariable("groupId") int groupId) {

        List<Poll> polls = pollRepository.groupPoll(groupId);

        // Iterate through contentList and handle null groups
        polls.forEach(poll -> {
            if (poll.getGroups() != null) {
                poll.setGroupId(poll.getGroups().getId());
            } else {
                poll.setGroupId(0); // or any other appropriate default value
            }
        });

        polls.forEach(poll -> poll.setUserId(poll.getUser().getId()));

        // Populate option texts for each poll
        // Populate option counts for each poll
        for (Poll poll : polls) {
            poll.setOptionTexts(poll.getOptionList());
            poll.setOptionId(poll.getOptionList());

            // Initialize option counts array
            int[] optionCounts = new int[poll.getOptionList().size()];

            // Calculate option counts
            int index = 0;
            for (OptionList option : poll.getOptionList()) {
                List<Vote> votes = voteService.findByOptionList(option);
                optionCounts[index] = votes.size();
                index++;
            }

            // Set option counts array
            poll.setOptionCounts(optionCounts);

            // Calculate total votes for the poll
            int totalVotes = Arrays.stream(optionCounts).sum();
            poll.setTotalVotes(totalVotes);

            System.out.println("option count: " + Arrays.toString(optionCounts));
            System.out.println("Total count: " + totalVotes);
        }


        return ResponseEntity.status(HttpStatus.OK).body(polls);
    }
// kym group feed of poll end //

//kym userFeed of poll //
    @GetMapping("/userPoll")
    public ResponseEntity<List<Poll>> userFeedOfPoll() {

        String staffId= SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userService.findByStaffId(staffId);
        int userId = user.getId();

        List<Poll> polls = pollRepository.userPollFeed(userId);

        // Iterate through contentList and handle null groups
        polls.forEach(poll -> {
            if (poll.getGroups() != null) {
                poll.setGroupId(poll.getGroups().getId());
            } else {
                poll.setGroupId(0); // or any other appropriate default value
            }
        });

        polls.forEach(poll -> poll.setUserId(poll.getUser().getId()));

        // Populate option texts for each poll
        // Populate option counts for each poll
        for (Poll poll : polls) {
            poll.setOptionTexts(poll.getOptionList());
            poll.setOptionId(poll.getOptionList());

            // Initialize option counts array
            int[] optionCounts = new int[poll.getOptionList().size()];

            // Calculate option counts
            int index = 0;
            for (OptionList option : poll.getOptionList()) {
                List<Vote> votes = voteService.findByOptionList(option);
                optionCounts[index] = votes.size();
                index++;
            }

            // Set option counts array
            poll.setOptionCounts(optionCounts);

            // Calculate total votes for the poll
            int totalVotes = Arrays.stream(optionCounts).sum();
            poll.setTotalVotes(totalVotes);

            System.out.println("option count: " + Arrays.toString(optionCounts));
            System.out.println("Total count: " + totalVotes);
        }


        return ResponseEntity.status(HttpStatus.OK).body(polls);
    }
//kym userFeed of poll end//

//kym poll list using poll id //
    @GetMapping("/searchPoll/{id}")
    public ResponseEntity<List<Poll>> searchPollListWithPollId(@PathVariable int id) {
        List<Poll> polls = pollRepository.userPollFeed(id);
        // Iterate through contentList and handle null groups
        polls.forEach(poll -> {
            if (poll.getGroups() != null) {
                poll.setGroupId(poll.getGroups().getId());
            } else {
                poll.setGroupId(0); // or any other appropriate default value
            }
        });
        polls.forEach(poll -> poll.setUserId(poll.getUser().getId()));
        // Populate option texts for each poll
        // Populate option counts for each poll
        for (Poll poll : polls) {
            poll.setOptionTexts(poll.getOptionList());
            poll.setOptionId(poll.getOptionList());
            // Initialize option counts array
            int[] optionCounts = new int[poll.getOptionList().size()];
            // Calculate option counts
            int index = 0;
            for (OptionList option : poll.getOptionList()) {
                List<Vote> votes = voteService.findByOptionList(option);
                optionCounts[index] = votes.size();
                index++;
            }
            // Set option counts array
            poll.setOptionCounts(optionCounts);
            // Calculate total votes for the poll
            int totalVotes = Arrays.stream(optionCounts).sum();
            poll.setTotalVotes(totalVotes);
            System.out.println("option count: " + Arrays.toString(optionCounts));
            System.out.println("Total count: " + totalVotes);
        }

        return ResponseEntity.status(HttpStatus.OK).body(polls);
    }
//kym poll list using poll id //

// kym poll createPoll //
    @PostMapping("/createPoll")
    public ResponseEntity<Map<String, String>> createPoll(@RequestBody PollRequestDTO pollRequest) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Poll Created Successfully");

        String staffId = SecurityContextHolder.getContext().getAuthentication().getName();
        User userExist = userService.findByStaffId(staffId);

        // Extract data from the request

        String question = pollRequest.getQuestion();
        String isPublic = pollRequest.getIsPublic();
        LocalDateTime endDate = pollRequest.getEndDate();

        List<String> optionTexts = pollRequest.getOptionTexts();
        List<String> filteredOptionTexts = optionTexts.stream()
                .filter(Objects::nonNull)
                .filter(text -> !text.trim().isEmpty())
                .collect(Collectors.toList());

        int groupId = pollRequest.getGroupId();
        System.out.println("gp id"+ groupId);
        Groups groups=groupRepository.findGroupsById(groupId);



        // Create a new poll
        Poll poll = new Poll();
        poll.setQuestion(question);
        poll.setIsPublic(isPublic);
        poll.setCreatedDate(LocalDateTime.now());
        poll.setEndDate(endDate);
        poll.setUser(userExist);
        poll.setGroups(groups);
        poll.setStatus(true);

        // Save the poll
        Poll savedPoll = pollService.save(poll);

        // Create options for the poll
        for (String optionText : filteredOptionTexts) {
            OptionList option = new OptionList();
            option.setOptionText(optionText);
            option.setStatus(true);
            option.setPoll(savedPoll);
            optionListService.save(option);
        }
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
// kym create poll end //

    // kym update pll //
    @PutMapping("/updatePoll")
    public ResponseEntity<String> updatePoll(@RequestBody UpdatePollRequest updateRequest) {
        int pollId = updateRequest.getId();
        LocalDateTime endDate = updateRequest.getEndDate();
        String isPublic = updateRequest.getIsPublic();

        List<String> newOptionTexts = updateRequest.getOptionTexts(); // Retrieve new option texts
        Optional<Poll> poll = pollRepository.findById(pollId);
        if (!poll.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Content not found");
        }
        Poll poll1 = poll.get();
        poll1.setEndDate(endDate);
        poll1.setIsPublic(isPublic);
        pollRepository.save(poll1);

        try {
            if (poll.isPresent()) {
                Poll existingPoll = poll.get();
                List<String> existingOptionTexts = optionListService.getAllOptionTextsByPoll(existingPoll);

                // Filter out existing option texts from new option texts
                List<String> optionTextsToAdd = newOptionTexts.stream()
                        .filter(text -> !existingOptionTexts.contains(text))
                        .collect(Collectors.toList());

                // Add only the new option texts
                optionListService.addNewPollOptions(existingPoll, optionTextsToAdd);

                return ResponseEntity.ok("Poll options updated successfully");
            } else {
                return ResponseEntity.notFound().build(); // Handle poll not found
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update poll options: " + e.getMessage());
        }
    }

// kym delete poll //
@PutMapping("/deletePoll/{id}/{optionId}")
public ResponseEntity<?> deletePoll(@PathVariable("id") int id, @PathVariable("optionId") int optionId) {
    Optional<Poll> optionalPoll = pollRepository.findById(id);
    if (optionalPoll.isPresent()) {
        Poll poll = optionalPoll.get();

        // Fetch all optionList entities related to the poll
        List<OptionList> optionLists = optionListRepository.findAllByPollId(id);

        // Update the status of all fetched optionList entities
        for (OptionList optionList : optionLists) {
            optionList.setStatus(false);
            optionListRepository.save(optionList);
        }

        // Set poll status to false or perform any other deletion logic if needed
        poll.setStatus(false); // For example, setting the status to false
        pollRepository.save(poll); // Save the updated poll entity

        return ResponseEntity.ok("Poll and its associated options deleted successfully");
    } else {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Poll not found");
    }
}



}