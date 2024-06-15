package com.ojt12.cybersquad.service;

import com.ojt12.cybersquad.dto.GroupMessageDto;
import com.ojt12.cybersquad.model.GroupMessage;
import com.ojt12.cybersquad.model.Groups;
import com.ojt12.cybersquad.repository.GroupMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GroupMessageService {
    @Autowired
    private GroupMessageRepository groupMessageRepository;
    public GroupMessage save(GroupMessage groupMessage) {
        return groupMessageRepository.save(groupMessage);
    }

    public List<GroupMessage> findChatMessagesByGroup(Groups groups) {
        return groupMessageRepository.findMessageByGroups(groups);
        }

    public Optional<GroupMessage> findById(int id) {
        return groupMessageRepository.findById(id);
    }
}

