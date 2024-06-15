package com.ojt12.cybersquad.controller;


import com.ojt12.cybersquad.dto.UserDto;
import com.ojt12.cybersquad.model.*;
import com.ojt12.cybersquad.repository.ContentRepository;
import com.ojt12.cybersquad.repository.SaveContentRepository;
import com.ojt12.cybersquad.service.ContentService;
import com.ojt12.cybersquad.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
public class SaveController {

    private final ContentService contentService;
    private final ContentRepository contentRepository;
    private final SaveContentRepository saveRepository;
    private final UserService userService;


    // post list  for new feed//
    @GetMapping("/saveContents")
    public ResponseEntity<List<Content>> userFeedOfContent() {

        String staffId= SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userService.findByStaffId(staffId);
        int userId = user.getId();

        List<Integer> contentList = saveRepository.getContentIdsByUserId(userId);
        List<Content> contentList1 = saveRepository.getContentByContentIds(contentList);
        contentList1.forEach(content1 -> { content1.setUserId(content1.getUser().getId());

            List<Resource> resources = content1.getResources();
            if (resources != null) {
                content1.setImageUrls(resources);
                content1.setVideoUrls(resources);
            }
        });

        return ResponseEntity.status(HttpStatus.OK).body(contentList1);
    }


    @PostMapping("/saveContent/{id}")
    public ResponseEntity<Map<String, String>> saveContent(@PathVariable("id") int id) {
        String staffId = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByStaffId(staffId);
        int userId = user.getId();

        SaveContent saveContent = new SaveContent();
        saveContent.setContentId(id);
        saveContent.setStatus(true); // Set status to true to indicate it's saved
        saveContent.setUserId(userId);
        saveRepository.save(saveContent); // Save the updated content entity
        System.out.println("Content saved successfully");
        return new ResponseEntity<>(HttpStatus.OK);

    }

    @GetMapping("/saveId/{id}")
    public ResponseEntity<SaveContent> getUserById(@PathVariable int id) {
        Optional<SaveContent> saveContent = saveRepository.findById(id);
        if (saveContent.isPresent()) {
            SaveContent saveContent1 = saveContent.get();
            SaveContent saveContent2 = new SaveContent(
                    saveContent1.getId(),
                    saveContent1.getContentId(),
                    saveContent1.getUserId()
            );
            return ResponseEntity.ok(saveContent2);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

//@GetMapping("/saveId/{saveId}")
//public ResponseEntity<SaveContent> getUserById(@PathVariable int saveId) {
//    Optional<SaveContent> saveContent = saveRepository.findById(saveId); // Correct repository method used here
//    if (saveContent.isPresent()) {
//        return ResponseEntity.ok(saveContent.get());
//    } else {
//        return ResponseEntity.notFound().build();
//    }
//}

    @PutMapping("/deleteSave/{id}")
    public ResponseEntity<?> deleteContent(@PathVariable("id") int id) {
        try {
            // Assuming saveId is being retrieved correctly from saveRepository
            int saveId = saveRepository.saveId(id);

            // Optional should be used to check the existence of the entity before deleting
            Optional<SaveContent> optionalSaveContent = saveRepository.findById(saveId);

            if (optionalSaveContent.isPresent()) {
                saveRepository.deleteById(saveId);
                return new ResponseEntity<>(HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            // Catch and handle exceptions, for example logging or returning a different status
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}