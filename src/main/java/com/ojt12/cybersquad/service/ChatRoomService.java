package com.ojt12.cybersquad.service;

import com.ojt12.cybersquad.model.ChatRoom;
import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.repository.ChatRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ChatRoomService {
    @Autowired
    private ChatRoomRepository chatRoomRepository;
    @Autowired
    private UserService userService;

    public Optional<String> getChatRoomId(User senderId, int recipientId, boolean createNewRoomIfNotExists) {
        if (senderId == null || recipientId == 0) {
            throw new IllegalArgumentException("Sender ID and Recipient ID must not be null or empty.");
        }

        Optional<ChatRoom> existingRoom = chatRoomRepository.findByUserAndRecipientId(senderId, recipientId);
        if (existingRoom.isPresent()) {
            return Optional.of(existingRoom.get().getChatId());
        }

        if (createNewRoomIfNotExists) {
            String chatId = createChatId(senderId.getId(), recipientId);
            return Optional.of(chatId);
        }

        return Optional.empty();
    }

    private String createChatId(int senderId, int recipientId) {
        String chatId = String.format("%s_%s", senderId, recipientId);
        ChatRoom senderRecipient = new ChatRoom();
        Optional<User> user=userService.findById(senderId);
        senderRecipient.setChatId(chatId);
        senderRecipient.setUser(user.get());
        senderRecipient.setRecipientId(recipientId);

        ChatRoom recipientSender = new ChatRoom();
        recipientSender.setChatId(chatId);
        Optional<User> user1=userService.findById(recipientId);
        recipientSender.setUser(user1.get());
        recipientSender.setRecipientId(senderId);

        chatRoomRepository.save(senderRecipient);
        chatRoomRepository.save(recipientSender);

        return chatId;
    }
}
