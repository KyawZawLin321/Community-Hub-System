package com.ojt12.cybersquad.repository;

import com.ojt12.cybersquad.model.Content;
import com.ojt12.cybersquad.model.Notification;
import com.ojt12.cybersquad.model.Share;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findByOwnerId(String ownerId);

    Notification findByOwnerIdAndMessageAndContent(String ownerId, String message, Content content);
    
     Notification findByOwnerIdAndMessageAndShare(String ownerId, String message, Share share);

    long countByOwnerIdAndIsReadFalse(String userId);

    List<Notification> findByOwnerIdAndIsReadFalse(String userId);

    boolean existsByOwnerIdAndTypeAndMessageAndTimeBetween(String s, String birthday, String birthdayOwnerMessage, LocalDateTime startOfDay, LocalDateTime endOfDay);
}
