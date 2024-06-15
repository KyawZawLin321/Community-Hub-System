package com.ojt12.cybersquad.controller;

import com.ojt12.cybersquad.dto.ContentDto;
import com.ojt12.cybersquad.dto.NotificationDto;
import com.ojt12.cybersquad.model.*;
import com.ojt12.cybersquad.repository.ContentRepository;
import com.ojt12.cybersquad.repository.GroupRepository;
import com.ojt12.cybersquad.repository.ResourceRepository;
import com.ojt12.cybersquad.service.CloudinaryImgService;
import com.ojt12.cybersquad.service.ContentService;
import com.ojt12.cybersquad.service.NotificationService;
import com.ojt12.cybersquad.service.UserService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;


// kym //
@RestController
@RequiredArgsConstructor
public class ContentController {
    private final ContentService contentService;
    private final ContentRepository contentRepository;
    private final ResourceRepository resourceRepository;
    private final CloudinaryImgService cloudinaryImgService;
    private final UserService userService;
    private final GroupRepository groupRepository;
    private final NotificationService notificationService;

// post list  for new feed//

    @GetMapping("/contents")
    public ResponseEntity<List<Content>> newFeedOfContent() {

        String publicStatus = "public";
        List<Content> contentList = contentRepository.newFeed(publicStatus);

        // Iterate through contentList and handle null groups
        contentList.forEach(content -> {
            if (content.getGroups() != null) {
                content.setGroupId(content.getGroups().getId());
            } else {
                content.setGroupId(0); // or any other appropriate default value
            }
        });
        // Populate image and video URLs for each content
        contentList.forEach(content -> { content.setUserId(content.getUser().getId());

            List<Resource> resources = content.getResources();
            if (resources != null) {
                content.setImageUrls(resources);
                content.setVideoUrls(resources);
            }
        });
        return ResponseEntity.status(HttpStatus.OK).body(contentList);
    }

// post list of group feed with group id //

    @GetMapping("/groupContents/{groupId}")
    public ResponseEntity<List<Content>> groupFeedOfContent(@PathVariable("groupId") int groupId, Model model) {
        // Your code to fetch content based on groupId
        List<Content> contentList = contentRepository.groupFeed(groupId);

        // Iterate through contentList and handle null groups
        contentList.forEach(content -> {
            if (content.getGroups() != null) {
                content.setGroupId(content.getGroups().getId());
            } else {
                content.setGroupId(0); // or any other appropriate default value
            }
        });
        // Populate image and video URLs for each content
        contentList.forEach(content -> { content.setUserId(content.getUser().getId());

            List<Resource> resources = content.getResources();
            if (resources != null) {
                content.setImageUrls(resources);
                content.setVideoUrls(resources);
            }
        });

        return ResponseEntity.status(HttpStatus.OK).body(contentList);
    }

// post list for user feed with user id //

    @GetMapping("/userContents")
    public ResponseEntity<List<Content>> userFeedOfContent() {

        String staffId= SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userService.findByStaffId(staffId);
        int userId = user.getId();

        List<Content> contentList1 = contentRepository.userFeed(userId);

        contentList1.forEach(content1 -> { content1.setUserId(content1.getUser().getId());

            List<Resource> resources = content1.getResources();
            if (resources != null) {
                content1.setImageUrls(resources);
                content1.setVideoUrls(resources);
            }
        });
        return ResponseEntity.status(HttpStatus.OK).body(contentList1);
    }
    @GetMapping("/trash-content")
    public ResponseEntity<List<Content>> trashContents() {

        String staffId= SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userService.findByStaffId(staffId);
        int userId = user.getId();

        List<Content> contentList1 = contentRepository.trash(userId);

        contentList1.forEach(content1 -> { content1.setUserId(content1.getUser().getId());

            List<Resource> resources = content1.getResources();
            if (resources != null) {
                content1.setImageUrls(resources);
                content1.setVideoUrls(resources);
            }
        });
        return ResponseEntity.status(HttpStatus.OK).body(contentList1);
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<List<Content>> searchProfileWithContentId(@PathVariable int id) {
        User user=userService.findById(id).orElse(null);
        int userId = user.getId();

        List<Content> contentList1 = contentRepository.userFeed(userId);

        contentList1.forEach(content1 -> { content1.setUserId(content1.getUser().getId());

            List<Resource> resources = content1.getResources();
            if (resources != null) {
                content1.setImageUrls(resources);
                content1.setVideoUrls(resources);
            }
        });
        return ResponseEntity.status(HttpStatus.OK).body(contentList1);
    }

// post create //
    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createContent(@RequestParam("text") String text,
                                                         @RequestParam("isPublic") String isPublic,
                                                         @RequestParam("groupId")int groupId,
                                                         @RequestParam("multipartFile") List<MultipartFile> multipartFiles) throws IOException {
    System.out.println("multi"+multipartFiles);
    Map<String, String> response = new HashMap<>();
    response.put("message", "Created Successfully");
    String staffId = SecurityContextHolder.getContext().getAuthentication().getName();
    User userExist = userService.findByStaffId(staffId);

    Groups groups=groupRepository.findGroupsById(groupId);

    if (multipartFiles != null) {

        // Create a new content object and set its properties
        Content content = new Content();
        content.setUser(userExist);
        content.setText(text);
        content.setIsPublic(isPublic);
        content.setCreatedDate(LocalDateTime.now());
        content.setStatus(true);
        content.setGroups(groups);
        contentService.save(content);

        // Process each uploaded file

        for (MultipartFile multipartFile : multipartFiles) {
            Resource resource = new Resource();
            resource.setContent(content);

            // Check if the file is not empty
            if (!multipartFile.isEmpty()) {
                // Check the content type of the file and handle accordingly
                if (multipartFile.getContentType().startsWith("image")) {
                    String imageUrl = cloudinaryImgService.uploadFile(multipartFile);
                    resource.setImageUrl(imageUrl);
                } else if (multipartFile.getContentType().startsWith("video")) {
                    String videoUrl = cloudinaryImgService.uploadVideo(multipartFile);
                    resource.setVideoUrl(videoUrl);
                }
                resourceRepository.save(resource);

                // Save the resource object to associate it with the content
            }
        }
        // Handle mentions
        List<String> mentionedUsernames = extractMentions(text);
        for (String username : mentionedUsernames) {
            User mentionedUser = userService.findByName(username.replaceAll("\\s", ""));
            if (mentionedUser != null) {
                String mentionMessage = userExist.getName() + " mentioned you in a post";
                notificationService.sendMentionNotification(mentionedUser.getId(), mentionMessage, content, userExist.getPhoto());
            }
        }

    } else {
        // Only text is provided, handle accordingly
        Content content = new Content();
        content.setUser(userExist);
        content.setText(text);
        content.setIsPublic(isPublic);
        content.setCreatedDate(LocalDateTime.now());
        content.setStatus(true);
        contentService.save(content);
    }
    // Get the currently authenticated user's staff id

    return ResponseEntity.status(HttpStatus.OK).body(response);
}
    public List<String> extractMentions(String text) {
        Pattern mentionPattern = Pattern.compile("@([\\w\\s]+?)(?=\\s|$|[^\\w\\s])");
        Matcher matcher = mentionPattern.matcher(text);
        List<String> mentions = new ArrayList<>();
        while (matcher.find()) {
            mentions.add(matcher.group(1).trim());
        }
        return mentions;
    }


//post update //
//@PutMapping("/group-post-update")
//public ResponseEntity<String> updateGroupContent(@RequestParam("id") int id,
//                                            @RequestParam("text") String text,
//                                            @RequestParam("isPublic") String isPublic,
//                                            @RequestParam("groupId")int groupId,
//                                            @RequestParam(value = "file", required = false) List<MultipartFile> files,
//                                            @RequestParam(value = "imageUrl", required = false) List<String> imageUrls,
//                                            @RequestParam(value = "videoUrl", required = false) List<String> videoUrls) {
//
//    System.out.println("files"+files);
//    System.out.println("imageUrls"+imageUrls);
//    System.out.println("videoUrls"+videoUrls);
//
//    try {
//        // Retrieve the current user's ID
//        String staffId = SecurityContextHolder.getContext().getAuthentication().getName();
//        User userExist = userService.findByStaffId(staffId);
//        Groups groups=groupRepository.findGroupsById(groupId);
//
//        // Retrieve the content from the database based on contentId
//        Optional<Content> contentOptional = contentService.findById(id);
//        if (!contentOptional.isPresent()) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Content not found");
//        }
//        Content content = contentOptional.get();
//
//        // Update content properties
//        content.setUser(userExist);
//        content.setText(text);
//        content.setIsPublic(isPublic);
//        content.setUpdatedDate(LocalDateTime.now());
//        content.setStatus(true);
//        content.setGroups(groups);
//        // Add any other properties you need to update
//
//        // Delete previous images and videos (if necessary)
////        Resource resourceExistk = resourceRepository.findById(content.getId()).orElse(null);
////        // Delete previous images and videos (if necessary)
//        List<Resource> resourcesExist1 = resourceRepository.findAllByContent(content);
//        for (Resource resourceExist : resourcesExist1) {
////            cloudinaryImgService.deleteFile(resourceExist.getImageUrl());
////            cloudinaryImgService.deleteFile(resourceExist.getVideoUrl());
//            resourceRepository.delete(resourceExist);
//        }
//
//
//        // Process uploaded files
//        if (files != null) {
//            for (MultipartFile file : files) {
//                // Handle file upload logic here
//                // Example: Save the file to a storage location or cloud service
//                if (file.getContentType().startsWith("image")) {
//                    String imageUrl = cloudinaryImgService.uploadFile(file);
////                    content.getImageUrls().add(imageUrl);
//
//                    // Save image resource to the database
//                    Resource resource = new Resource();
//                    resource.setContent(content);
//                    resource.setImageUrl(imageUrl);
//                    resourceRepository.save(resource);
//                } else if (file.getContentType().startsWith("video")) {
//                    String videoUrl = cloudinaryImgService.uploadVideo(file);
////                    content.getVideoUrls().add(videoUrl);
//
//                    // Save video resource to the database
//                    Resource resource = new Resource();
//                    resource.setContent(content);
//                    resource.setVideoUrl(videoUrl);
//                    resourceRepository.save(resource);
//                }
//            }
//        }
//        // Process image URLs
//        if (imageUrls != null) {
//            // Save image URLs to resources
//            for (String imageUrl : imageUrls) {
//                Resource resource = new Resource();
//                resource.setContent(content);
//                resource.setImageUrl(imageUrl);
//                resourceRepository.save(resource);
//            }
//        }
//        // Process video URLs
//        if (videoUrls != null) {
//            // Save video URLs to resources
//            for (String videoUrl : videoUrls) {
//                Resource resource = new Resource();
//                resource.setContent(content);
//                resource.setVideoUrl(videoUrl);
//                resourceRepository.save(resource);
//            }
//        }
//        // Save the updated content
//        contentService.save(content);
//        return ResponseEntity.ok("Content updated successfully");
//    } catch (IOException e) {
//        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update content: " + e.getMessage());
//    }
//}

// kym post update //
@PutMapping("/update")
public ResponseEntity<String> updateContent(@RequestParam("id") int id,
                                            @RequestParam("text") String text,
                                            @RequestParam("isPublic") String isPublic,
                                            @RequestParam("groupId")int groupId,
                                            @RequestParam(value = "file", required = false) List<MultipartFile> files,
                                            @RequestParam(value = "imageUrl", required = false) List<String> imageUrls,
                                            @RequestParam(value = "videoUrl", required = false) List<String> videoUrls) {

    System.out.println("files"+files);
    System.out.println("imageUrls"+imageUrls);
    System.out.println("videoUrls"+videoUrls);

    try {
        // Retrieve the current user's ID
        String staffId = SecurityContextHolder.getContext().getAuthentication().getName();
        User userExist = userService.findByStaffId(staffId);
        Groups groups=groupRepository.findGroupsById(groupId);

        // Retrieve the content from the database based on contentId
        Optional<Content> contentOptional = contentService.findById(id);
        if (!contentOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Content not found");
        }
        Content content = contentOptional.get();

        // Update content properties
        content.setUser(userExist);
        content.setText(text);
        content.setIsPublic(isPublic);
        content.setUpdatedDate(LocalDateTime.now());
        content.setStatus(true);
        content.setGroups(groups);
        // Add any other properties you need to update

        // Delete previous images and videos (if necessary)
//        Resource resourceExistk = resourceRepository.findById(content.getId()).orElse(null);
//        // Delete previous images and videos (if necessary)
        List<Resource> resourcesExist1 = resourceRepository.findAllByContent(content);
        for (Resource resourceExist : resourcesExist1) {
//            cloudinaryImgService.deleteFile(resourceExist.getImageUrl());
//            cloudinaryImgService.deleteFile(resourceExist.getVideoUrl());
            resourceRepository.delete(resourceExist);
        }


        // Process uploaded files
        if (files != null) {
            for (MultipartFile file : files) {
                // Handle file upload logic here
                // Example: Save the file to a storage location or cloud service
                if (file.getContentType().startsWith("image")) {
                    String imageUrl = cloudinaryImgService.uploadFile(file);
//                    content.getImageUrls().add(imageUrl);

                    // Save image resource to the database
                    Resource resource = new Resource();
                    resource.setContent(content);
                    resource.setImageUrl(imageUrl);
                    resourceRepository.save(resource);
                } else if (file.getContentType().startsWith("video")) {
                    String videoUrl = cloudinaryImgService.uploadVideo(file);
//                    content.getVideoUrls().add(videoUrl);

                    // Save video resource to the database
                    Resource resource = new Resource();
                    resource.setContent(content);
                    resource.setVideoUrl(videoUrl);
                    resourceRepository.save(resource);
                }
            }
        }
        // Process image URLs
        if (imageUrls != null) {
            // Save image URLs to resources
            for (String imageUrl : imageUrls) {
                Resource resource = new Resource();
                resource.setContent(content);
                resource.setImageUrl(imageUrl);
                resourceRepository.save(resource);
            }
        }
        // Process video URLs
        if (videoUrls != null) {
            // Save video URLs to resources
            for (String videoUrl : videoUrls) {
                Resource resource = new Resource();
                resource.setContent(content);
                resource.setVideoUrl(videoUrl);
                resourceRepository.save(resource);
            }
        }
        // Save the updated content
        contentService.save(content);
        return ResponseEntity.ok("Content updated successfully");
    } catch (IOException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update content: " + e.getMessage());
    }
}
// kym post update //

// kym post delete //
@PutMapping("/delete/{id}")
public ResponseEntity<?> deleteContent(@PathVariable("id") int id) {
    Optional<Content> optionalContent = contentRepository.findById(id);
    if (optionalContent.isPresent()) {
        Content content = optionalContent.get();

        content.setDeletedDate(LocalDateTime.now());
        content.setStatus(false); // Set status to false instead of deleting
        contentRepository.save(content); // Save the updated content entity
        System.out.println("is ok");
        return new ResponseEntity<>(HttpStatus.OK);
    } else {
        return new ResponseEntity<>("Content not found", HttpStatus.NOT_FOUND);
    }
}
    @PutMapping("/restore-content/{id}")
    public ResponseEntity<?> restoreContent(@PathVariable("id") int id) {
        Optional<Content> optionalContent = contentRepository.findById(id);
        if (optionalContent.isPresent()) {
            Content content = optionalContent.get();

            content.setStatus(true); // Set status to false instead of deleting
            contentRepository.save(content); // Save the updated content entity
            System.out.println("is ok");
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Content not found", HttpStatus.NOT_FOUND);
        }
    }
    @PutMapping("/delete-content/{id}")
    public ResponseEntity<?> realDelete(@PathVariable("id") int id) {
        Optional<Content> optionalContent = contentRepository.findById(id);
        if (optionalContent.isPresent()) {
            Content content = optionalContent.get();
            contentRepository.delete(content); // Save the updated content entity
            System.out.println("is ok");
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Content not found", HttpStatus.NOT_FOUND);
        }
    }
// kym post delete //


// kym content find using content id for share //
    @GetMapping("/content/{contentId}")
    @ResponseBody
    public ResponseEntity<ContentDto> getContentByIdForShare(@PathVariable int contentId) {

        String publicStatus = "public";

        Optional<Content> contentOptional = Optional.ofNullable(contentRepository.findByContentIdForShare(contentId,publicStatus));
        if (contentOptional.isPresent()) {
            Content content = contentOptional.get();
            List<String> imageUrls = content.getResources().stream()
                    .filter(resource -> resource.getImageUrl() != null)
                    .map(Resource::getImageUrl)
                    .collect(Collectors.toList());
            List<String> videoUrls = content.getResources().stream()
                    .filter(resource -> resource.getVideoUrl() != null)
                    .map(Resource::getVideoUrl)
                    .collect(Collectors.toList());
            ContentDto contentDto = new ContentDto(
                    content.getId(),
                    content.getText(),
                    content.getIsPublic(),
                    content.getCreatedDate(),
                    content.getUpdatedDate(),
                    content.isStatus(),
                    imageUrls,
                    videoUrls
            );
            return ResponseEntity.ok(contentDto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
// kym content find using content id for share //

// post day //
    @GetMapping("/posts-by-day/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Integer>> getContentPostsByDayOfWeek(@PathVariable int id) {

        Map<String, Integer> data = new HashMap<>();
        List<Content> content = contentService.getContentsByUserId(id);

        for (Content post : content) {
            LocalDateTime creationDate = post.getCreatedDate();
            String dayOfWeek = creationDate.getDayOfWeek().toString();
            data.put(dayOfWeek, data.getOrDefault(dayOfWeek, 0) + 1);
        }
        return ResponseEntity.ok(data);
    }
    @PostConstruct
    public void auto() {
        // Schedule a task to check for birthdays
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        scheduler.scheduleAtFixedRate(this::autoDelete, 0, 1, TimeUnit.DAYS);
        System.out.println("auto");

    }

    public void autoDelete() {


        List<Content> contentList1 = contentRepository.findByStatus(false);
        System.out.println(contentList1);
       // LocalDateTime now = LocalDateTime.of(2024, 7, 21, 23, 46, 54, 637757200);
        LocalDateTime now = LocalDateTime.now();

        System.out.println("now :" +now);
        // Assuming Content has a getDeletedDate() method that returns a LocalDateTime
        contentList1.forEach(content1 -> {
            if (content1.getDeletedDate().isBefore(now.minus(30, ChronoUnit.DAYS))) {
                contentRepository.delete(content1);
            }
        });


    }
}


// post  day //
// kym //