package com.ojt12.cybersquad.service;

import com.ojt12.cybersquad.dto.NotificationDto;
import com.ojt12.cybersquad.model.*;
import com.ojt12.cybersquad.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    @Autowired
    SimpMessagingTemplate messagingTemplate;
    @Autowired
    NotificationRepository notiRepo;
    @Autowired
    UserService userService;

    public void sendPrivateNotification(final String ownerId, String message, Content content,String photo) {
        Notification noti = new Notification();
        noti.setContent(content);
        noti.setMessage(message);
        noti.setOwnerId(ownerId);
        noti.setPhoto(photo);
        noti.setTime(LocalDateTime.now());
        notiRepo.save(noti);
        NotificationDto notiDto = new NotificationDto();
        notiDto.setId(noti.getId());
        notiDto.setMessage(noti.getMessage());
        notiDto.setPhoto(noti.getPhoto());
        notiDto.setContentId(String.valueOf(noti.getContent().getId()));
        notiDto.setTime(noti.getTime());
        notiDto.setContentId(String.valueOf(noti.getContent().getId()));
        messagingTemplate.convertAndSendToUser(ownerId,"/private-message", notiDto);
    }
//public List<NotificationDto> getAllNotification(int userId) {
//        List<Notification> notifications = notiRepo.findByOwnerId(String.valueOf(userId));
//        List<NotificationDto> notificationDtos = new ArrayList<>();
//        for(Notification notification : notifications) {
//            NotificationDto notificationDto = new NotificationDto();
//            notificationDto.setId(notification.getId());
//            notificationDto.setMessage(notification.getMessage());
//            notificationDto.setPhoto(notification.getPhoto());
//            notificationDto.setContentId(String.valueOf(notification.getContent().getId()));
//            notificationDto.setTime(notification.getTime());
//            // Add any other fields you need in the DTO
//            notificationDtos.add(notificationDto);
//        }
//        return notificationDtos;
//    }
public List<NotificationDto> getAllNotification(int userId) {
    List<Notification> notifications = notiRepo.findByOwnerId(String.valueOf(userId));
    List<NotificationDto> notificationDtos = new ArrayList<>();
    for(Notification notification : notifications) {
        NotificationDto notificationDto = new NotificationDto();
        notificationDto.setId(notification.getId());
        notificationDto.setMessage(notification.getMessage());
        notificationDto.setPhoto(notification.getPhoto());
        notificationDto.setRead(notification.isRead());
        if (notification.getContent() != null && !isBirthdayNotification(notification)) {
            notificationDto.setContentId(String.valueOf(notification.getContent().getId()));
        }
        notificationDto.setTime(notification.getTime());
        notificationDto.setType(notification.getType());
        if(notification.getEvent()!=null){
            notificationDto.setEventId(String.valueOf(notification.getEvent().getId()));
        }
        if(notification.getGroup()!=null){
            notificationDto.setGroupId(String.valueOf((notification.getGroup().getId())));
        }

        notificationDtos.add(notificationDto);
    }
    return notificationDtos;
}

    private boolean isBirthdayNotification(Notification notification) {
        // Implement logic to determine if it is a birthday notification
        // For example, you can check if the message contains "has a birthday today!"
        return notification.getMessage().contains("has a birthday today!");
    }


    public void removeLikedNotification(Content content, User user) {

        String ownerId = String.valueOf(content.getUserId());
        String message = user.getName() + " liked your post!";
        Notification notification = notiRepo.findByOwnerIdAndMessageAndContent(ownerId, message, content);

        if (notification != null) {
            notiRepo.delete(notification);
        }
    }

    public void sendCommentNotification(int ownerId, String message, Content content,String photo) {
        Notification noti = new Notification();
        noti.setContent(content);
        noti.setMessage(message);
        noti.setPhoto(photo);
        noti.setOwnerId(String.valueOf(ownerId));
        noti.setTime(LocalDateTime.now());
        notiRepo.save(noti);
        NotificationDto notiDto= new NotificationDto();
        notiDto.setId(noti.getId());
        notiDto.setMessage(noti.getMessage());
        notiDto.setPhoto(noti.getPhoto());
        notiDto.setContentId(String.valueOf(noti.getContent().getId()));
        notiDto.setTime(noti.getTime());
        messagingTemplate.convertAndSendToUser(String.valueOf(ownerId),"/private-message", notiDto);
    }

    public void sendReplyNotification(int ownerId, String message, Content content, String photo) {
        Notification noti = new Notification();
        noti.setContent(content);
        noti.setMessage(message);
        noti.setPhoto(photo);
        noti.setOwnerId(String.valueOf(ownerId));
        noti.setTime(LocalDateTime.now());
        notiRepo.save(noti);
        NotificationDto notiDto= new NotificationDto();
        notiDto.setId(noti.getId());
        notiDto.setMessage(noti.getMessage());
        notiDto.setPhoto(noti.getPhoto());
        notiDto.setContentId(String.valueOf(noti.getContent().getId()));
        notiDto.setTime(noti.getTime());
        messagingTemplate.convertAndSendToUser(String.valueOf(ownerId),"/private-message", notiDto);
    }
    public Notification save(int ownerId, String message, Content content, String photo) {
        Notification noti = new Notification();
        noti.setOwnerId(String.valueOf(ownerId));
        noti.setMessage(message);
        noti.setContent(content);
        noti.setPhoto(photo);
        noti.setTime(LocalDateTime.now());
        return notiRepo.save(noti);
    }

    public void deleteNotificationById(int notificationId) {
        notiRepo.deleteById(notificationId);
    }

    public void sendShareCommentNotification(int ownerId, String message, Share share, String photo) {
        Notification noti = new Notification();
        noti.setShare(share);
        noti.setMessage(message);
        noti.setPhoto(photo);
        noti.setOwnerId(String.valueOf(ownerId));
        noti.setTime(LocalDateTime.now());
        notiRepo.save(noti);
        NotificationDto notiDto= new NotificationDto();
        notiDto.setId(noti.getId());
        notiDto.setMessage(noti.getMessage());
        notiDto.setPhoto(noti.getPhoto());
        notiDto.setShareId(String.valueOf(noti.getShare().getId()));
        notiDto.setTime(noti.getTime());
        messagingTemplate.convertAndSendToUser(String.valueOf(ownerId),"/private-message", notiDto);
    }

    public Notification saveShareNoti(int ownerId, String message, Share share, String photo) {
        Notification noti = new Notification();
        noti.setOwnerId(String.valueOf(ownerId));
        noti.setMessage(message);
        noti.setShare(share);
        noti.setPhoto(photo);
        noti.setTime(LocalDateTime.now());
        return notiRepo.save(noti);
    }

    public void sendShareReplyNotification(int ownerId, String message, Share share, String photo) {
        Notification noti = new Notification();
        noti.setShare(share);
        noti.setMessage(message);
        noti.setPhoto(photo);
        noti.setOwnerId(String.valueOf(ownerId));
        noti.setTime(LocalDateTime.now());
        notiRepo.save(noti);
        NotificationDto notiDto= new NotificationDto();
        notiDto.setId(noti.getId());
        notiDto.setMessage(noti.getMessage());
        notiDto.setPhoto(noti.getPhoto());
        notiDto.setShareId(String.valueOf(noti.getShare().getId()));
        notiDto.setTime(noti.getTime());
        messagingTemplate.convertAndSendToUser(String.valueOf(ownerId),"/private-message", notiDto);

    }

    public Notification saveShareReply(int ownerId, String message, Share share, String photo) {
        Notification noti = new Notification();
        noti.setOwnerId(String.valueOf(ownerId));
        noti.setMessage(message);
        noti.setShare(share);
        noti.setPhoto(photo);
        noti.setTime(LocalDateTime.now());
        return notiRepo.save(noti);

    }

    public void sendSharePostPrivateNotification(String ownerId, String message, Share share, String photo) {
        Notification noti = new Notification();
        noti.setShare(share);
        noti.setMessage(message);
        noti.setOwnerId(ownerId);
        noti.setPhoto(photo);
        noti.setTime(LocalDateTime.now());
        notiRepo.save(noti);
        NotificationDto notiDto = new NotificationDto();
        notiDto.setId(noti.getId());
        notiDto.setMessage(noti.getMessage());
        notiDto.setPhoto(noti.getPhoto());
        notiDto.setShareId(String.valueOf(noti.getShare().getId()));
        notiDto.setTime(noti.getTime());

        messagingTemplate.convertAndSendToUser(ownerId,"/private-message", notiDto);
    }

    public void removeLikedPostNotification(Share share, User user) {
        String ownerId = String.valueOf(share.getShareUserId());
        String message = user.getName() + " liked your post!";
        Notification notification = notiRepo.findByOwnerIdAndMessageAndShare(ownerId, message, share);

        if (notification != null) {
            notiRepo.delete(notification);
        }
    }
    public long getUnreadNotificationCount(String userId) {
        return notiRepo.countByOwnerIdAndIsReadFalse(userId);
    }

    public void markAllAsRead(String userId) {
        List<Notification> notifications = notiRepo.findByOwnerIdAndIsReadFalse(userId);
        for (Notification notification : notifications) {
            notification.setRead(true);
        }
        notiRepo.saveAll(notifications);
    }

    public void sendMentionNotification(int mentionedUserId, String message, Content content, String photo) {
        Notification noti = new Notification();
        noti.setContent(content);
        noti.setMessage(message);
        noti.setPhoto(photo);
        noti.setOwnerId(String.valueOf(mentionedUserId));
        noti.setTime(LocalDateTime.now());
        notiRepo.save(noti);

        NotificationDto notiDto = new NotificationDto();
        notiDto.setId(noti.getId());
        notiDto.setMessage(noti.getMessage());
        notiDto.setPhoto(noti.getPhoto());
        notiDto.setContentId(String.valueOf(noti.getContent().getId()));
        notiDto.setTime(noti.getTime());

        messagingTemplate.convertAndSendToUser(String.valueOf(mentionedUserId), "/private-message", notiDto);
    }
    public void sendMentionSharedNotification(int mentionedUserId, String message, Share share, String photo) {
        Notification noti = new Notification();
        noti.setShare(share);
        noti.setMessage(message);
        noti.setPhoto(photo);
        noti.setOwnerId(String.valueOf(mentionedUserId));
        noti.setTime(LocalDateTime.now());
        notiRepo.save(noti);

        NotificationDto notiDto = new NotificationDto();
        notiDto.setId(noti.getId());
        notiDto.setMessage(noti.getMessage());
        notiDto.setPhoto(noti.getPhoto());
        notiDto.setShareId(String.valueOf(noti.getShare().getId()));
        notiDto.setTime(noti.getTime());

        messagingTemplate.convertAndSendToUser(String.valueOf(mentionedUserId), "/private-message", notiDto);
    }


    public void sendNotificationToAllUsers(String notificationMessage, Event event) {
        List<User> users = userService.getUser();
        String eventCreatorId = String.valueOf(event.getUser().getId());

        for (User user : users) {
            String userId = String.valueOf(user.getId());

            // Skip the event creator
            if (!userId.equals(eventCreatorId)) {
                Notification eventNoti = new Notification();
                eventNoti.setOwnerId(userId);
                eventNoti.setEvent(event);
                eventNoti.setMessage(notificationMessage);
                eventNoti.setPhoto(event.getPhotoFile());
                eventNoti.setRead(false);
                eventNoti.setType("event");
                eventNoti.setTime(LocalDateTime.now());

                notiRepo.save(eventNoti);

                NotificationDto eventNotiDto = createNotificationDto(eventNoti);

                messagingTemplate.convertAndSendToUser(userId, "/private-message", eventNotiDto);
            }
        }
    }

    private NotificationDto createNotificationDto(Notification eventNoti) {
        NotificationDto notiDto = new NotificationDto();
        notiDto.setId(eventNoti.getId());
        notiDto.setMessage(eventNoti.getMessage());
        notiDto.setPhoto(eventNoti.getPhoto());
        notiDto.setEventId(String.valueOf(eventNoti.getEvent().getId()));
        notiDto.setType(eventNoti.getType());
        notiDto.setTime(eventNoti.getTime());
        return notiDto;

    }

    public void sendSharedNotification(String ownerId, String message, Share share1, String photo) {
        Notification noti = new Notification();
        noti.setShare(share1);
        noti.setMessage(message);
        noti.setPhoto(photo);
        noti.setOwnerId(ownerId);
        noti.setTime(LocalDateTime.now());
        notiRepo.save(noti);

        NotificationDto notiDto = new NotificationDto();
        notiDto.setId(noti.getId());
        notiDto.setMessage(noti.getMessage());
        notiDto.setPhoto(noti.getPhoto());
        notiDto.setShareId(String.valueOf(noti.getShare().getId()));
        notiDto.setTime(noti.getTime());

        messagingTemplate.convertAndSendToUser(ownerId, "/private-message", notiDto);
    }

    public void sendGroupInviteNotification(String recipent,String message, Groups group, String photo) {

        String groupCreatorId = String.valueOf(group.getOwnerId());

                Notification groupNoti = new Notification();
                groupNoti.setOwnerId(recipent);
                groupNoti.setGroup(group);
                groupNoti.setMessage(message);
                groupNoti.setPhoto(photo);
                groupNoti.setRead(false);
                groupNoti.setType("group");
                groupNoti.setTime(LocalDateTime.now());

                notiRepo.save(groupNoti);

                NotificationDto groupNotiDto = createGroupNotificationDto(groupNoti);

                messagingTemplate.convertAndSendToUser(recipent, "/private-message", groupNotiDto);

    }

    private NotificationDto createGroupNotificationDto(Notification groupNoti) {
        NotificationDto notiDto = new NotificationDto();
        notiDto.setId(groupNoti.getId());
        notiDto.setMessage(groupNoti.getMessage());
        notiDto.setPhoto(groupNoti.getPhoto());
        notiDto.setGroupId(String.valueOf(groupNoti.getGroup().getId()));
        notiDto.setType(groupNoti.getType());
        notiDto.setTime(groupNoti.getTime());
        return notiDto;
    }
}
