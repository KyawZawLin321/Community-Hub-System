package com.ojt12.cybersquad.controller;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.ojt12.cybersquad.dto.ChatMessageDto;
import com.ojt12.cybersquad.dto.GroupMessageDto;
import com.ojt12.cybersquad.dto.GroupsDto;
import com.ojt12.cybersquad.dto.UserDto;
import com.ojt12.cybersquad.model.ChatMessage;
import com.ojt12.cybersquad.model.GroupMessage;
import com.ojt12.cybersquad.model.Groups;
import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.repository.GroupMessageRepository;
import com.ojt12.cybersquad.service.*;
import jakarta.servlet.http.HttpSession;
import javassist.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Controller
public class ChatController {
    @Autowired
    public  SimpMessagingTemplate messagingTemplate;
    @Autowired
    private ChatMessageService chatMessageService;
    @Autowired
    private UserService userService;
    @Autowired
    private GroupService groupService;
    @Autowired
    private GroupMessageService groupMessageService;
    @Autowired
    private CloudinaryImgService cloudinaryImgService;
    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessage chatMessage) throws IOException {
        Optional<User> user = userService.findById(Integer.parseInt(chatMessage.getSenderId()));
        chatMessage.setUser(user.get());
        if (chatMessage.getContent() != null && !chatMessage.getType().equals("text")) {
            byte[] decodedBytes = Base64.getDecoder().decode(chatMessage.getContent());
            MultipartFile multipartFile;
            String url = "";

            switch (chatMessage.getType()) {
                case "voice":
                    multipartFile = new Base64MultipartFile(decodedBytes, "data:audio/wav;base64");
                    url = cloudinaryImgService.uploadVoice(multipartFile);
                    break;
                case "image":
                    multipartFile = new Base64MultipartFile(decodedBytes, "data:image/jpeg;base64");
                    url = cloudinaryImgService.uploadFile(multipartFile);
                    break;
                case "video":
                    multipartFile = new Base64MultipartFile(decodedBytes, "data:video/mp4;base64");
                    url = cloudinaryImgService.uploadVideo(multipartFile);
                    break;

            }

            chatMessage.setContent(url);
        }
        chatMessage.setContent(chatMessage.getContent());
        ChatMessage savedMsg = chatMessageService.save(chatMessage);
        ChatMessageDto chatMessageDto=new ChatMessageDto(savedMsg.getContent(),savedMsg.getTime(),savedMsg.getRecipientId(),savedMsg.getUser().getId(),savedMsg.getChatId(),savedMsg.getType());
        messagingTemplate.convertAndSendToUser(
                chatMessage.getRecipientId(), "/queue/messages",
                chatMessageDto
        );

    }

    @GetMapping("/messages/{senderId}/{selectedUserId}")
    public ResponseEntity<List<ChatMessageDto>> findChatMessages(@PathVariable String senderId,
                                                              @PathVariable String selectedUserId) {
        Optional<User> user=userService.findById(Integer.parseInt(senderId));
        List<ChatMessage> messages=chatMessageService.findChatMessages(user.get(), Integer.parseInt(selectedUserId));
       List<ChatMessageDto> chatMessageDto=messages.stream().map(message-> new ChatMessageDto(
                                                                   message.getContent(),
                                                                   message.getTime(),
                                                                   message.getRecipientId(),
                                                                   message.getUser().getId(),
                                                                    message.getChatId(),
                                                                    message.getType()
                                                           )).collect(Collectors.toList());


        return ResponseEntity
                .ok(chatMessageDto);
    }



    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> findConnectedUsers() {
        List<User>users=userService.findByStatus(true);
        List<UserDto> userDtos = users.stream()
                .map(user -> new UserDto(
                        user.getStaffId(),
                        user.getName(),
                        user.getDepartment(),
                        user.getTeam(),
                        user.getRole(),
                        user.getPhoto(),
                        user.getId()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);

    }
    @GetMapping("/roomList")
    public ResponseEntity<List<GroupsDto>> groupList() {
        Authentication auth= SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByStaffId(auth.getName());
        List<Integer> groupIds  = groupService.findGroupIdsByUserId(user.getId());
        List<Groups> groups = groupService.findGroupsByIds(groupIds);

        System.out.println(groups);
        List<GroupsDto> groupsDtos = groups.stream()
                .map(group -> new GroupsDto(
                        group.getId(),
                        group.getName(),
                        group.getPhoto(),
                        group.isStatus()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(groupsDtos);
    }
@MessageMapping("/group-chat")
public void groupMessage(@Payload GroupMessage messagePayload) throws IOException, NotFoundException {
    System.out.println("Incoming payload: " + messagePayload.getContent());

    ObjectMapper objectMapper = new ObjectMapper();

    Optional<User> user = userService.findById(messagePayload.getSenderId());
    Optional<Groups> groups = groupService.findGroupsByRoomId(messagePayload.getRoomId());


    if (messagePayload.getContent() != null && !messagePayload.getType().equals("text")) {
        byte[] decodedBytes = Base64.getDecoder().decode(messagePayload.getContent());
        MultipartFile multipartFile;
        String url = "";

        switch (messagePayload.getType()) {
            case "voice":
                multipartFile = new Base64MultipartFile(decodedBytes, "data:audio/wav;base64");
                url = cloudinaryImgService.uploadVoice(multipartFile);
                break;
            case "image":
                multipartFile = new Base64MultipartFile(decodedBytes, "data:image/jpeg;base64");
                url = cloudinaryImgService.uploadFile(multipartFile);
                break;
            case "video":
                multipartFile = new Base64MultipartFile(decodedBytes, "data:video/mp4;base64");
                url = cloudinaryImgService.uploadVideo(multipartFile);
                break;

        }

        messagePayload.setContent(url);
    }
    messagePayload.setContent(messagePayload.getContent());

    messagePayload.setUser(user.orElseThrow(() -> new NotFoundException("User not found")));
    messagePayload.setGroups(groups.orElseThrow(() -> new NotFoundException("Group not found")));

    GroupMessage savedMsg = groupMessageService.save(messagePayload);

    GroupMessageDto groupMessageDto = new GroupMessageDto(
            savedMsg.getContent(),
            savedMsg.getTime(),
            savedMsg.getUser().getId(),
            savedMsg.getRoomId(),
            savedMsg.getName(),
            savedMsg.getType(),
            savedMsg.getId()
    );

    messagingTemplate.convertAndSendToUser(
            String.valueOf(messagePayload.getRoomId()), "/queue/messages",
            groupMessageDto
    );
}

    @MessageMapping("/message-delete")
    public void deleteMessage(@Payload GroupMessage messagePayload) {
        Optional<GroupMessage> exist=groupMessageService.findById(messagePayload.getId());
        exist.get().setType(messagePayload.getType());

        GroupMessage savedMsg = groupMessageService.save(exist.get());

        GroupMessageDto groupMessageDto = new GroupMessageDto(
                savedMsg.getContent(),
                savedMsg.getTime(),
                savedMsg.getUser().getId(),
                savedMsg.getRoomId(),
                savedMsg.getName(),
                savedMsg.getType(),
                savedMsg.getId()
        );

        messagingTemplate.convertAndSendToUser(
                String.valueOf(messagePayload.getRoomId()), "/queue/messages",
                groupMessageDto
        );
    }
//    @MessageMapping("/chat-editMessage")
//    public void updateMessage(@Payload GroupMessage messagePayload) throws IOException {
//        Optional<GroupMessage> exist=groupMessageService.findById(messagePayload.getId());
//        exist.get().setType(messagePayload.getType());
//        if(messagePayload.getType().equals("image")){
//            byte[] decodedBytes = Base64.getDecoder().decode(messagePayload.getContent());
//            MultipartFile multipartFile=new Base64MultipartFile(decodedBytes, "data:image/jpeg;base64");
//         String url = cloudinaryImgService.uploadFile(multipartFile);
//            exist.get().setContent(url);
//
//        }else if(messagePayload.getType().equals("video")){
//            byte[] decodedBytes = Base64.getDecoder().decode(messagePayload.getContent());
//            MultipartFile  multipartFile = new Base64MultipartFile(decodedBytes, "data:video/mp4;base64");
//            String url = cloudinaryImgService.uploadVideo(multipartFile);
//            exist.get().setContent(url);
//        }else{
//            exist.get().setContent(messagePayload.getContent());
//
//        }
//        GroupMessage savedMsg = groupMessageService.save(exist.get());
//
//        GroupMessageDto groupMessageDto = new GroupMessageDto(
//                savedMsg.getContent(),
//                savedMsg.getTime(),
//                savedMsg.getUser().getId(),
//                savedMsg.getRoomId(),
//                savedMsg.getName(),
//                savedMsg.getType(),
//                savedMsg.getId()
//        );
//
//        messagingTemplate.convertAndSendToUser(
//                String.valueOf(messagePayload.getRoomId()), "/queue/messages",
//                groupMessageDto
//        );
//    }
@MessageMapping("/chat-editMessage")
public void updateMessage(@Payload GroupMessage messagePayload) {
    try {
        Optional<GroupMessage> exist = groupMessageService.findById(messagePayload.getId());

        if (exist.isPresent()) {
            GroupMessage existingMessage = exist.get();
            existingMessage.setType(messagePayload.getType());

            if (messagePayload.getType().equals("editimage") || messagePayload.getType().equals("editvideo")) {
                // Decode Base64 content for image or video
                byte[] decodedBytes = Base64.getDecoder().decode(messagePayload.getContent());
                MultipartFile multipartFile;
                String url = "";

                if (messagePayload.getType().equals("editimage")) {
                    // Create multipart file for image
                    multipartFile = new Base64MultipartFile(decodedBytes, "data:image/jpeg;base64");
                    url = cloudinaryImgService.uploadFile(multipartFile);
                } else if (messagePayload.getType().equals("editvideo")) {
                    // Create multipart file for video
                    multipartFile = new Base64MultipartFile(decodedBytes, "data:video/mp4;base64");
                    url = cloudinaryImgService.uploadVideo(multipartFile);
                }

                existingMessage.setContent(url);
            } else {
                existingMessage.setContent(messagePayload.getContent());
            }

            GroupMessage savedMsg = groupMessageService.save(existingMessage);

            GroupMessageDto groupMessageDto = new GroupMessageDto(
                    savedMsg.getContent(),
                    savedMsg.getTime(),
                    savedMsg.getUser().getId(),
                    savedMsg.getRoomId(),
                    savedMsg.getName(),
                    savedMsg.getType(),
                    savedMsg.getId()
            );

            messagingTemplate.convertAndSendToUser(
                    String.valueOf(messagePayload.getRoomId()), "/queue/messages",
                    groupMessageDto
            );
        } else {
            throw new NotFoundException("Message not found with id: " + messagePayload.getId());
        }
    } catch (IllegalArgumentException | NotFoundException e) {
        // Log the error for debugging
        e.printStackTrace();
        // Handle the error, e.g., send an error message to the client
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}





    @GetMapping("/messages/{id}")
    public ResponseEntity<List<GroupMessageDto>> findChatMessages(@PathVariable("id")int id){
        Optional<Groups> groups=groupService.findGroupsByRoomId(id);
       List<GroupMessage> groupMessages=groupMessageService.findChatMessagesByGroup(groups.get());
        List<GroupMessageDto> groupMessageDtos=groupMessages.stream().map(message-> new GroupMessageDto(
                message.getContent(),
                message.getTime(),
                message.getUser().getId(),
                message.getRoomId(),
                message.getName(),
                message.getType(),
                message.getId()
        )).collect(Collectors.toList());
        return ResponseEntity.ok(groupMessageDtos);
    }
}
