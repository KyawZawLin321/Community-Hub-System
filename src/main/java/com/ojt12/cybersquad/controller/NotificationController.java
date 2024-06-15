package com.ojt12.cybersquad.controller;

import com.ojt12.cybersquad.dto.NotificationDto;
import com.ojt12.cybersquad.model.*;
import com.ojt12.cybersquad.repository.NotificationRepository;
import com.ojt12.cybersquad.service.CommentService;
import com.ojt12.cybersquad.service.NotificationService;
import com.ojt12.cybersquad.service.UserService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.HtmlUtils;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@RestController
public class NotificationController {

    @Autowired
    private NotificationService notificationService;
    @Autowired
    private CommentService commentService;
    @Autowired
    private UserService userService;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    NotificationRepository notiRepo;
    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);
    @MessageMapping("/private-message")
    @SendToUser("/private-message")
    public NotificationDto getPrivateMessage(final NotificationDto notification) throws InterruptedException {

        return notification;
    }
    @GetMapping("/notification/{userId}")
    public List<NotificationDto> getAllNotification(@PathVariable int userId) {
        return notificationService.getAllNotification(userId);
    }

    @DeleteMapping("/api/notifications/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable int notificationId) {

            notificationService.deleteNotificationById(notificationId);
            System.out.println("success");
        return ResponseEntity.ok().build();

    }

    @PostConstruct
    public void setupBirthdayNotifications() {
        // Schedule a task to check for birthdays daily
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        scheduler.scheduleAtFixedRate(this::sendBirthdayNotifications, 0, 1, TimeUnit.DAYS);
    }
    private Queue<NotificationDto> notificationQueue = new LinkedList<>();

    @MessageMapping("/sendBirthdayNotifications")
    public void sendBirthdayNotifications() {
        log.info("Sending birthday notifications...");
        try {
            List<User> users = userService.getUser();
            LocalDate date = LocalDate.now();
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

            // Filter users with a birthday today and exclude users with no dob
            List<User> birthdayUsers = users.stream()
                    .filter(user -> user.getDob() != null &&
                            user.getDob().getMonth() == date.getMonth() &&
                            user.getDob().getDayOfMonth() == date.getDayOfMonth())
                    .toList();

            if (!birthdayUsers.isEmpty()) {
                for (User birthdayUser : birthdayUsers) {
                    String birthdayOwnerMessage = "Today is your birthday, Happy Birthday!";
                    String birthdayPhoto = birthdayUser.getPhoto();
                    LocalDateTime now = LocalDateTime.now();

                    // Send notification to the birthday owner
                    boolean ownerNotificationExists = notiRepo.existsByOwnerIdAndTypeAndMessageAndTimeBetween(
                            String.valueOf(birthdayUser.getId()), "birthday", birthdayOwnerMessage, startOfDay, endOfDay);

                    if (!ownerNotificationExists) {
                        Notification ownerNotification = new Notification();
                        ownerNotification.setOwnerId(String.valueOf(birthdayUser.getId()));
                        ownerNotification.setMessage(birthdayOwnerMessage);
                        ownerNotification.setPhoto(birthdayPhoto);
                        ownerNotification.setTime(now);
                        ownerNotification.setRead(false);
                        ownerNotification.setType("birthday");
                        notiRepo.save(ownerNotification);

                        NotificationDto ownerNotiDto = createNotificationDto(ownerNotification);
                        notificationQueue.offer(ownerNotiDto);
                        messagingTemplate.convertAndSendToUser(birthdayUser.getName(), "/private-message", ownerNotiDto);
                    }

                    // Send notification to other users
                    String birthdayMessage = "Today is " + birthdayUser.getName() + "'s birthday!";
                    for (User user : users) {
                        if (user.getId() != birthdayUser.getId()) {
                            boolean notificationExists = notiRepo.existsByOwnerIdAndTypeAndMessageAndTimeBetween(
                                    String.valueOf(user.getId()), "birthday", birthdayMessage, startOfDay, endOfDay);

                            if (!notificationExists) {
                                Notification notification = new Notification();
                                notification.setOwnerId(String.valueOf(user.getId()));
                                notification.setMessage(birthdayMessage);
                                notification.setPhoto(birthdayPhoto);
                                notification.setTime(now);
                                notification.setRead(false);
                                notification.setType("birthday");
                                notiRepo.save(notification);

                                NotificationDto notiDto = createNotificationDto(notification);
                                notificationQueue.offer(notiDto);
                                messagingTemplate.convertAndSendToUser(user.getName(), "/private-message", notiDto);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error sending birthday notifications", e);
        }
    }

    public NotificationDto createNotificationDto(Notification notification) {
        NotificationDto notiDto = new NotificationDto();
        notiDto.setId(notification.getId());
        notiDto.setMessage(notification.getMessage());
        notiDto.setPhoto(notification.getPhoto());
        notiDto.setTime(notification.getTime());
        return notiDto;
    }


    //Endpoint to retrieve stored notifications
    @GetMapping("/storedNotifications")
    public List<NotificationDto> getStoredNotifications() {
        List<NotificationDto> notifications = new ArrayList<>(notificationQueue);
        // Optionally clear the queue after retrieving notifications
        // notificationQueue.clear();
        return notifications;
    }
    @GetMapping("/api/notifications/count/{userId}")
    public long getUnreadNotificationCount(@PathVariable String userId) {
        return notificationService.getUnreadNotificationCount(userId);
    }

    @PostMapping("/api/notifications/resetcount/{userId}")
    public void resetNotificationCount(@PathVariable String userId) {
        notificationService.markAllAsRead(userId);
    }


}
