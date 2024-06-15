package com.ojt12.cybersquad.controller;


import com.ojt12.cybersquad.model.Event;
import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.repository.EventRepository;
import com.ojt12.cybersquad.service.CloudinaryImgService;
import com.ojt12.cybersquad.service.EventService;
import com.ojt12.cybersquad.service.NotificationService;
import com.ojt12.cybersquad.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import javassist.NotFoundException;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/*STRM*/
@RestController

public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private UserService userService;

    @Autowired
    private CloudinaryImgService cloudinaryImgService;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private NotificationService notificationService;



    /*Create Event*/
    @PostMapping("/admin/createEvent")
    public ResponseEntity<Event> createPost(@ModelAttribute("event") Event event,
                                            @RequestParam("file") MultipartFile file) throws IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByStaffId(auth.getName());
        if (file != null && !file.isEmpty()) {
            String photoUrl = cloudinaryImgService.uploadFile(file);
            event.setPhotoFile(photoUrl);
        }

        // Set other attributes of the event
        event.setContent(event.getContent());
        event.setStartDate(event.getStartDate());
        System.out.println(event.getStartDate());
        event.setEndDate(event.getEndDate());
        event.setEventDetails(event.getEventDetails());
        event.setStatus(true);
        event.setNotifications(event.getNotifications());
        event.setCreatedDate(event.getCreatedDate());
        event.setUser(user);

        Event createdEvent = eventService.createPost(event);

        //swm
        String notificationMessage = "A new event has been created: " + event.getContent();
        notificationService.sendNotificationToAllUsers(notificationMessage,event);
        //swm
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    /*View Event*/
    @GetMapping("/view")
    public ResponseEntity<?> listActiveEvents() {
        List<Event> events = eventService.getEventsByStatus(true); // Fetch events with status 1 (active)
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    /*View Event Detail*/
    @GetMapping("/detail/{id}")
    public Event getEvent(@PathVariable int id) {
        // Retrieve the event data from your data source (e.g. database)
        Event event = eventRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Event not found"));
        return event;
    }



    /*Update Event */
    @GetMapping("/admin/event/{id}")
    public Event getupdateEvent(@PathVariable int id) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Event not found"));
        return event;
    }


    @PostMapping("/admin/updateEvent/{eventId}")
    public ResponseEntity<String> updateEvent(@PathVariable int eventId,
                                              @RequestParam(value = "file", required = false) MultipartFile file,
                                              @RequestParam(value = "content") String content,
                                              @RequestParam(value = "startDate") LocalDateTime startDate,
                                              @RequestParam(value = "endDate") LocalDateTime endDate,
                                              @RequestParam(value = "eventDetails") String eventDetails) {
        try {
            // Retrieve the event from the database using eventId
            Event eventToUpdate = eventRepository.findById(eventId)
                    .orElseThrow(() -> new EntityNotFoundException("Event not found"));

            // Check if the current date is greater than the start date
            LocalDateTime currentDate = LocalDateTime.now();
            if (currentDate.isAfter(startDate)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cannot update event with a past start date");
            }

            // Process file upload if a file is provided
            if (file != null && !file.isEmpty()) {
                String fileUrl = cloudinaryImgService.uploadFile(file);
                eventToUpdate.setPhotoFile(fileUrl);
            }

            // Update event data with values from the request
            eventToUpdate.setContent(content);
            eventToUpdate.setStartDate(startDate);
            eventToUpdate.setEndDate(endDate);
            eventToUpdate.setEventDetails(eventDetails);

            // Save the updated event
            eventRepository.save(eventToUpdate);

            return ResponseEntity.ok("Event updated successfully");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Event not found: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update event: " + e.getMessage());
        }
    }




   /*Delete Event*/
   @DeleteMapping("/admin/deleteEvent/{id}")
   public ResponseEntity<String> softDeleteEventById(@PathVariable("id") int id) {
       try {
           eventService.softDeleteEventById(id); // Update the status of the event to indicate soft delete
           return new ResponseEntity<>(HttpStatus.OK);
       } catch (Exception e) {
           return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
       }
   }

}
/*STRM*/