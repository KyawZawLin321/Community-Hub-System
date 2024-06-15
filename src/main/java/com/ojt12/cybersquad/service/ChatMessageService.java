package com.ojt12.cybersquad.service;
import com.ojt12.cybersquad.model.ChatMessage;
import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChatMessageService {
    @Autowired
    public ChatMessageRepository chatMessageRepository;
    @Autowired
    public  ChatRoomService chatRoomService;

    public ChatMessage save(ChatMessage chatMessage) {
        var chatId = chatRoomService
                .getChatRoomId(chatMessage.getUser(), Integer.parseInt(chatMessage.getRecipientId()), true)
                .orElseThrow(); // You can create your own dedicated exception
        chatMessage.setChatId(chatId);
        chatMessageRepository.save(chatMessage);
        return chatMessage;
    }

    public List<ChatMessage> findChatMessages(User senderId, int recipientId) {
        var chatId = chatRoomService.getChatRoomId(senderId, recipientId, false);
        return chatId.map(chatMessageRepository::findByChatId).orElse(new ArrayList<>());
    }
}
