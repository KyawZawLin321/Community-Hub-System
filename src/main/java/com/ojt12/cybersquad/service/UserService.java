package com.ojt12.cybersquad.service;

import com.ojt12.cybersquad.dto.UserDto;
import com.ojt12.cybersquad.dto.UserResponse;
import com.ojt12.cybersquad.model.Groups;
import com.ojt12.cybersquad.model.Skill;
import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.repository.GroupRepository;
import com.ojt12.cybersquad.repository.UserRepository;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
/*KZL*/

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Transactional
    public User findByStaffId(String staffId) {
        return userRepository.findByStaffId(staffId);
    }


    public List<User> getUser() {

        return userRepository.findAll();
    }

    public User save(User existingUser) {
        return userRepository.save(existingUser);
    }

    public List<User> findByStatus(boolean b) {
        return userRepository.findByStatus(b);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }


    public List<User> findConnectedUsers() {
        return userRepository.findAllByStatus(true);
    }


//public List<UserDto> searchUser(String keyword) {
//    List<User> matchingUsers = userRepository.findAll((Specification<User>) (root, query, criteriaBuilder) -> {
//        List<Predicate> predicates = new ArrayList<>();
//
//        // Replace spaces in the name column
//        Expression<String> nameWithoutSpaces = criteriaBuilder.function("REPLACE", String.class,
//                criteriaBuilder.lower(root.get("name")),
//                criteriaBuilder.literal(" "),
//                criteriaBuilder.literal(""));
//
//        // Prepare the keyword for matching
//        String keywordWithoutSpaces = keyword.toLowerCase().replaceAll(" ", "");
//
//        // Create the LIKE predicate
//        predicates.add(criteriaBuilder.like(nameWithoutSpaces, "%" + keywordWithoutSpaces + "%"));
//
//        return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
//    });
//
//    matchingUsers = matchingUsers.stream()
//            .filter(User::isStatus)
//            .collect(Collectors.toList());
//
//    return matchingUsers.stream()
//            .map(user -> new UserDto(
//                    user.getStaffId(),
//                    user.getName(),
//                    user.getDepartment(),
//                    user.getTeam(),
//                    user.getRole(),
//                    user.getPhoto(),
//                    user.getId()
//            ))
//            .collect(Collectors.toList());
//}
public List<UserDto> searchUser(String keyword) {
    List<User> matchingUsers = userRepository.findAll((Specification<User>) (root, query, criteriaBuilder) -> {
        List<Predicate> predicates = new ArrayList<>();

        // Create predicates for name, department, and team
        Expression<String> nameWithoutSpaces = criteriaBuilder.function("REPLACE", String.class,
                criteriaBuilder.lower(root.get("name")),
                criteriaBuilder.literal(" "),
                criteriaBuilder.literal(""));
        System.out.println("name :"+nameWithoutSpaces);
        Expression<String> departmentWithoutSpaces = criteriaBuilder.function("REPLACE", String.class,
                criteriaBuilder.lower(root.get("department")),
                criteriaBuilder.literal(" "),
                criteriaBuilder.literal(""));
        Expression<String> teamWithoutSpaces = criteriaBuilder.function("REPLACE", String.class,
                criteriaBuilder.lower(root.get("team")),
                criteriaBuilder.literal(" "),
                criteriaBuilder.literal(""));
        predicates.add(criteriaBuilder.like(nameWithoutSpaces, "%" + keyword.toLowerCase().replaceAll(" ", "") + "%"));

        predicates.add(criteriaBuilder.like(departmentWithoutSpaces, "%" + keyword.toLowerCase().replaceAll(" ", "") + "%"));
        predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("team")), "%" + keyword.toLowerCase().replaceAll(" ", "") + "%"));

        // Combine all predicates with OR
        Predicate[] predicatesArray = predicates.toArray(new Predicate[0]);
        return criteriaBuilder.or(predicatesArray);
    });

    matchingUsers = matchingUsers.stream()
            .filter(User::isStatus)
            .collect(Collectors.toList());

    return matchingUsers.stream()
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
}


    public Optional<User> findById(int userId) {
        return userRepository.findById(userId);
    }

    public Optional<User> findUserById(int userId) {
        return userRepository.findById(userId);
    }

//    public Optional<User> getUserById(int userId) {
//        return userRepository.findById(userId);
//    }



public User getUserById(Integer userId) {
    return userRepository.getUserById(userId);
}
/*KZL*/

public List<User> findUsersNotInGroup(Integer groupId, Integer currentUserId) {
    Groups group = groupRepository.findById(groupId).orElse(null);
    User currentUser = userRepository.findById(currentUserId).orElse(null);

    List<User> nonGroupUsers = new ArrayList<>();

    if (group != null && currentUser != null) {
        nonGroupUsers = userRepository.findUsersNotInGroup(group);
        nonGroupUsers.removeAll(group.getUsers());
        //nonGroupUsers.remove(currentUser);
    }
    return nonGroupUsers;
}



// kym //
public List<String> getSkillOptionsForUser(User user) {
    List<Skill> userSkills = user.getSkills();

    List<String> skillOptions = new ArrayList<>();

    // Iterate over the user's skills and extract the skill options
    for (Skill skill : userSkills) {
        skillOptions.add(skill.getSkillOption());
    }

    return skillOptions;
}


//kym//
public User findByName(String usernameWithoutSpaces) {
    return userRepository.findByNameWithoutSpaces(usernameWithoutSpaces).orElse(null);
}

    public List<UserResponse> searchUsers(String query) {
        List<User> users = userRepository.findByNameContainingIgnoreCase(query);
        return users.stream()
                .map(user -> {
                    UserResponse dto = new UserResponse();
                    String usernameWithoutSpaces = user.getName().replaceAll("\\s", "");
                    dto.setName(usernameWithoutSpaces);
                    dto.setId(user.getId());  // Ensure this is the correct field
                    dto.setStaffId(user.getStaffId());
                    return dto;
                })
                .collect(Collectors.toList());
    }
    public void updateUserNotificationPreference(int userId, boolean notificationsEnabled) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setNotificationsEnabled(notificationsEnabled);
            userRepository.save(user);
        }
    }
}
