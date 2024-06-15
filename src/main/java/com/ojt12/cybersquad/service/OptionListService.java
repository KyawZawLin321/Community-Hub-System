package com.ojt12.cybersquad.service;

import com.ojt12.cybersquad.model.OptionList;
import com.ojt12.cybersquad.model.Poll;
import com.ojt12.cybersquad.repository.OptionListRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

//kym //

@Service
@RequiredArgsConstructor
public class OptionListService {

    @Autowired
    OptionListRepository optionListRepository;

    public void save(OptionList optionList) {
        optionListRepository.save(optionList);
    }

    public Optional<OptionList> findByPoll(Poll poll) {
        return optionListRepository.findById(poll.getId());
    }

    public void updatePollOptions(Optional<Poll> poll, List<String> optionTexts) {
        if (poll.isPresent()) {
            Poll existingPoll = poll.get();

            // Remove existing options for the poll
//            optionListService.deleteOptionsByPollId(existingPoll.getId());

            // Create new options for the poll
            for (String optionText : optionTexts) {
                OptionList option = new OptionList();
                option.setOptionText(optionText);
                option.setStatus(true);
                option.setPoll(existingPoll);
                optionListRepository.save(option);
            }
        } else {
        }
    }


//    public List<String> getAllOptionTextsByPoll(Poll poll) {
//        List<OptionList> options = optionListRepository.findByPoll(poll);
//        return options.stream()
//                .map(OptionList::getOptionText)
//                .collect(Collectors.toList());
//    }
//
//    @Transactional
//    public void addNewPollOptions(Poll poll, List<String> newOptionTexts) {
//        if (newOptionTexts != null && !newOptionTexts.isEmpty()) {
//            for (String optionText : newOptionTexts) {
//                OptionList option = new OptionList();
//                option.setOptionText(optionText);
//                option.setStatus(true);
//                option.setPoll(poll);
//                optionListRepository.save(option);
//            }
//        }
//    }


    public List<String> getAllOptionTextsByPoll(Poll poll) {
        List<OptionList> options = optionListRepository.findByPoll(poll);
        return options.stream()
                .map(OptionList::getOptionText)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addNewPollOptions(Poll poll, List<String> newOptionTexts) {
        if (newOptionTexts != null && !newOptionTexts.isEmpty()) {
            List<String> existingOptionTexts = getAllOptionTextsByPoll(poll); // Retrieve existing option texts

            for (String optionText : newOptionTexts) {
                String trimmedOptionText = optionText.trim();
                if (!existingOptionTexts.contains(trimmedOptionText) && !trimmedOptionText.isEmpty()) { // Check if option text already exists after trimming and if it's not empty
                    OptionList option = new OptionList();
                    option.setOptionText(trimmedOptionText); // Trim the option text before saving
                    option.setStatus(true);
                    option.setPoll(poll);
                    optionListRepository.save(option);
                }
            }
        }
    }


}

// kym //