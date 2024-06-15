package com.ojt12.cybersquad.service;

import com.ojt12.cybersquad.dto.GroupsDto;
import com.ojt12.cybersquad.dto.UserDto;
import com.ojt12.cybersquad.model.Groups;
import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.repository.GroupRepository;
import com.ojt12.cybersquad.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GroupService {
    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

//Char Char
    public Groups createGroup(Groups group) {
        return groupRepository.save(group);
    }

    public void addUsersToGroup(Integer groupId, List<Integer> userIds) {
        Groups group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        List<User> users = userRepository.findAllById(userIds);
        group.getUsers().addAll(users);
        groupRepository.save(group);
    }

    public Groups updateGroup(Groups group) {
        Groups existingGroup = groupRepository.findById(group.getId()).orElse(null);
        if (existingGroup != null) {
            existingGroup.setName(group.getName());
            existingGroup.setPhoto(group.getPhoto());
            return groupRepository.save(existingGroup);
        }
        return null;
    }
    public List<Groups> getAllGroups() {

        return groupRepository.findAll();
    }
    public Groups getGroupById(int id) {

        return groupRepository.findById(id).orElse(null);
    }
    public List<Groups> getUserGroups(String name) {

        return groupRepository.findByname(name);
    }

    public List<Groups> findByname(String name) {
        return groupRepository.findByname(name);
    }

    public Groups findGroupsById(int groupId) {
        return groupRepository.findGroupsById(groupId);
    }

    public List<Groups> findByStatus(boolean b) {
        return groupRepository.findByStatus(b);
    }

    public Groups save(Groups existingGroups) {
        return groupRepository.save(existingGroups);
    }
    public List<User> getSelectedUsersInGroup(int groupId) {
        Groups group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found"));
        return group.getUsers();
    }
    public List<Groups> getActiveGroups() {
        return groupRepository.findAll();
    }
    public List<Groups> statusTrueGroup(){
        return groupRepository.findByStatus(true);
    }
    public List<User> getNonGroupUsers(int groupId) {
        Groups group = groupRepository.findGroupsById(groupId);
        if (group == null) {
            return Collections.emptyList();
        }
        return userRepository.findUsersNotInGroup(group);
    }

//  Char Char

    /*KZL*/
    public List<Groups> findGroupsByIds(List<Integer> groupIds) {
        return groupRepository.findAllById(groupIds);
    }

    public List<Integer> findGroupIdsByUserId(int userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            return user.getGroups().stream().map(Groups::getId).collect(Collectors.toList());
        } else {
            return Collections.emptyList();
        }
    }


    public Optional<Groups> findGroupsByRoomId(int roomId) {
        return groupRepository.findById(roomId);
    }

    public List<GroupsDto> searchGroup(String keyword) {
        List<Groups> matchingGroups = groupRepository.findAll((Specification<Groups>) (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            Expression<String> nameWithoutSpaces = criteriaBuilder.function("REPLACE", String.class,
                    criteriaBuilder.lower(root.get("name")),
                    criteriaBuilder.literal(" "),
                    criteriaBuilder.literal(""));

            // Prepare the keyword for matching
            String keywordWithoutSpaces = keyword.toLowerCase().replaceAll(" ", "");

            // Create the LIKE predicate
            predicates.add(criteriaBuilder.like(nameWithoutSpaces, "%" + keywordWithoutSpaces + "%"));
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        });
        matchingGroups = matchingGroups.stream()
                .filter(groups -> groups.isStatus())
                .collect(Collectors.toList());

        List<GroupsDto> groupsDtos = matchingGroups.stream()
                .map(groups -> new GroupsDto(
                        groups.getId(),
                        groups.getName(),
                        groups.getPhoto(),
                        groups.isStatus()
                ))
                .collect(Collectors.toList());
        return groupsDtos;
    }


    /*KZL*/


}




