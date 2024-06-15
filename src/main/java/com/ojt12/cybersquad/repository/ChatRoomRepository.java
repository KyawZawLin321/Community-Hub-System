package com.ojt12.cybersquad.repository;


import com.ojt12.cybersquad.model.ChatRoom;
import com.ojt12.cybersquad.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Integer> {
    Optional<ChatRoom> findByUserAndRecipientId(User senderId, int recipientId);
}
