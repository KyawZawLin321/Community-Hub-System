package com.ojt12.cybersquad.controller;//
import com.ojt12.cybersquad.dto.GroupsDto;
import com.ojt12.cybersquad.dto.UserDto;
import com.ojt12.cybersquad.model.Content;
import com.ojt12.cybersquad.model.Groups;
import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.repository.GroupRepository;
import com.ojt12.cybersquad.repository.UserRepository;
import com.ojt12.cybersquad.service.*;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/group")
public class GroupController {
    @Autowired
    private GroupService groupService;
    @Autowired
    private CloudinaryImgService cloudinaryImgService;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ContentService contentService;
    private final GroupRepository groupRepository;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    public GroupController(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    //Char Char :3
    @GetMapping("/createPage")
    public ModelAndView createGroupPage(Model model, HttpSession session) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Authorities: " + authentication.getAuthorities());
       // if (isAdmin(authentication)) {
            String currentUserStaffId = authentication.getName();
            User currentUser = userService.findByStaffId(currentUserStaffId);

        if(passwordEncoder.matches("123@dat",currentUser.getPassword())){

            return new ModelAndView("redirect:/password");
        }
            List<Groups> userGroups = currentUser.getGroups();
            System.out.println("User Groups: " + userGroups);
            userGroups = userGroups.stream()
                    .filter(Groups::isStatus)
                    .collect(Collectors.toList());
        model.addAttribute("userList", userService.findByStatus(true));
        List<Groups> groups = groupService.getActiveGroups();
            model.addAttribute("userGroups", userGroups);
        if (isAdmin(authentication)) {
            model.addAttribute("groups", groups);
        }else{
            model.addAttribute("groups", userGroups);
        }

            model.addAttribute("user",currentUser);
            session.setAttribute("groupId",groups);
        model.addAttribute("page","creategroup");
        return new ModelAndView("/admin/createGroup", "group", new Groups());

    }
    @PutMapping("/{groupId}/restore")
    public ResponseEntity<Groups> restoreGroup(@PathVariable int groupId) {
        Groups existingGroup = groupService.getGroupById(groupId);
        if (existingGroup != null) {
            existingGroup.setStatus(true);
            groupRepository.save(existingGroup);
            return ResponseEntity.ok(existingGroup);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    @PostMapping("/{groupId}/changeOwner")
    @ResponseBody
    public ResponseEntity<GroupsDto> changeOwner(@RequestBody GroupsDto groups) {
        Groups existingGroup = groupService.getGroupById(groups.getId());
        existingGroup.setOwnerId(groups.getOwnerId());
        groupRepository.save(existingGroup);
        GroupsDto groupsDto=new GroupsDto(existingGroup.getId(),existingGroup.getName(),existingGroup.getPhoto(),existingGroup.isStatus());

        return ResponseEntity.ok(groupsDto);
    }


    @GetMapping("/group-active")
    public ModelAndView groupActive(Model model, HttpSession session) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserStaffId = authentication.getName();
        User currentUser = userService.findByStaffId(currentUserStaffId);
        if(passwordEncoder.matches("123@dat",currentUser.getPassword())){

            return new ModelAndView("redirect:/password");
        }
        List<Groups> groups = groupService.statusTrueGroup();
        Map<Integer, Content> latestContentsMap = new HashMap<>();
        Map<Integer, Integer>  contentCountMap = new HashMap<>();
        Map<Integer, User> mostActiveUserMap = new HashMap<>();

        for (Groups group : groups) {
            Content latestContent = contentService.findLatestContentByGroupId(group.getId());
            if (latestContent != null) {
                if (!latestContentsMap.containsKey(group.getId()) ||
                        latestContent.getCreatedDate().isAfter(latestContentsMap.get(group.getId()).getCreatedDate())) {
                    latestContentsMap.put(group.getId(), latestContent);
                }
            }
            int contentCount = contentService.countByGroupId(group.getId());
            contentCountMap.put(group.getId(), contentCount);
            List<Object[]> result = (List<Object[]>) contentService.findUserWithMostContentByGroupId(group.getId());
            if (!result.isEmpty()) {
                User mostActiveUser = (User) result.get(0)[0];
                mostActiveUserMap.put(group.getId(), mostActiveUser);
            }

        }
        System.out.println(contentCountMap);
        // Convert map values to list
        List<Content> latestContents = new ArrayList<>(latestContentsMap.values());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-M-d h:mm:ss a");
        List<String> formattedDates = latestContents.stream()
                .map(content -> content != null ? content.getCreatedDate().format(formatter) : "N/A")
                .collect(Collectors.toList());

        model.addAttribute("groups", groups);
        model.addAttribute("user",currentUser);
        model.addAttribute("contents",formattedDates);
        model.addAttribute("contentCounts", contentCountMap);
        model.addAttribute("mostActiveUsers", mostActiveUserMap);

        return new ModelAndView("/admin/groupactive", "group", new Groups());

    }
    @PostMapping("/create")
    public String createGroup(@ModelAttribute Groups group,
                              @RequestParam("photoFile") MultipartFile photoFile,
                              @RequestParam("userIds") List<Integer> userIds,
                              @RequestParam("ownerId") int ownerId,Model model) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (isAdmin(authentication)) {
            try {
                String photoUrl = cloudinaryImgService.uploadFile(photoFile);
                group.setPhoto(photoUrl);
                group.setOwnerId(ownerId);
                Groups createdGroup = groupService.createGroup(group);

                List<User> users = userRepository.findAllById(userIds);
                for (User user : users) {
                    user.getGroups().add(createdGroup);
                }
                userRepository.saveAll(users);

                return "redirect:/group/groups";
            } catch (Exception e) {
                System.out.println(e.getMessage());
                return "error";
            }
        } else {
            return "error";
        }
    }

    @GetMapping("/groups")
    public String getGroups(Model model) {
    List<Groups> groups = groupService.getAllGroups();
    model.addAttribute("groups", groups);

    for (Groups group : groups) {
        List<User> users = groupService.getSelectedUsersInGroup(group.getId());
        model.addAttribute("usersfrom" + group.getId(), users);
    }
            return "redirect:/group/createPage";
}

    @GetMapping("/{groupId}/selectedUsers")
    public ResponseEntity<?> getSelectedUsersInGroup(@PathVariable("groupId") Integer groupId) {
        List<User> users = groupService.getSelectedUsersInGroup(groupId);
        if (users == null) {
            return ResponseEntity.notFound().build();
        }
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

    @DeleteMapping("/{groupId}/removeUser/{userId}")
    public ResponseEntity<?> removeUserFromGroup(@PathVariable("groupId") Integer groupId, @PathVariable("userId") Integer userId) {
        Groups group = groupService.getGroupById(groupId);
        if (group == null) {
            return ResponseEntity.notFound().build();
        }
        User user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        if (!group.getUsers().contains(user)) {
            return ResponseEntity.notFound().build();
        }

        group.getUsers().remove(user);
        groupRepository.save(group);

        user.getGroups().remove(group);
        userRepository.save(user);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Groups> softDeleteGroup(@PathVariable("id") Integer id) {
        Groups existingGroup = groupService.getGroupById(id);
        if (existingGroup != null) {

            existingGroup.setDeletedDate(LocalDateTime.now());
            existingGroup.setStatus(false);
            Groups updatedGroup = groupService.updateGroup(existingGroup);
            return ResponseEntity.ok(updatedGroup);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/{groupId}/nonGroupUsers")
    public ResponseEntity<List<UserDto>> getNonGroupUsers(@PathVariable("groupId") Integer groupId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserStaffId = authentication.getName();
        User currentUser = userService.findByStaffId(currentUserStaffId);
        List<User> nonGroupUsers = userService.findUsersNotInGroup(groupId, currentUser.getId());
        List<UserDto> nonGroupUserDtos = nonGroupUsers.stream()
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

        return ResponseEntity.ok(nonGroupUserDtos);
    }



    @PostMapping("/{groupId}/inviteUser/{userId}")
    public ResponseEntity<?> inviteUserToGroup(@PathVariable("groupId") Integer groupId, @PathVariable("userId") Integer userId) {
        Groups group = groupService.getGroupById(groupId);
        if (group == null) {
            return ResponseEntity.notFound().build();
        }
        User user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        if (group.getUsers().contains(user)) {
            return ResponseEntity.badRequest().body("User is already a member of the group.");
        }
        group.getUsers().add(user);
        groupRepository.save(group);

        user.getGroups().add(group);
        userRepository.save(user);

        //swm
        String recipent = String.valueOf(user.getId());
        String photo = group.getPhoto();
        String message = "You have been invited to group: " + group.getName();
        notificationService.sendGroupInviteNotification(recipent,message,group,photo);
        //swm

        return ResponseEntity.ok().build();
    }




    @PostMapping("/update/{groupId}")
    public ResponseEntity<?> updateGroup(@PathVariable Integer groupId,
                                         @RequestParam("name") String name,
                                         @RequestParam(value = "photoFile", required = false) MultipartFile photoFile) {
        Groups existingGroup = groupService.getGroupById(groupId);
        if (existingGroup == null) {
            return ResponseEntity.notFound().build();
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        try {
            if (photoFile != null && !photoFile.isEmpty()) {
                String photoUrl = cloudinaryImgService.uploadFile(photoFile);
                existingGroup.setPhoto(photoUrl);
            }
            existingGroup.setName(name);

            Groups updatedGroup = groupService.updateGroup(existingGroup);
            if (updatedGroup != null) {
                return ResponseEntity.ok().body("Group updated successfully");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update group.");
            }
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update group.");
        }
    }

    @GetMapping("/{groupId}")
    public String viewGroupPage(@PathVariable("groupId") int groupId,Model model){
        Authentication auth= SecurityContextHolder.getContext().getAuthentication();
        User user=userService.findByStaffId(auth.getName());
        List<Groups> userGroups = user.getGroups();
        userGroups = userGroups.stream()
                .filter(Groups::isStatus)
                .collect(Collectors.toList());
        List<User> users = groupService.getSelectedUsersInGroup(groupId);
        List<UserDto> userList = users.stream()
                .map(user1 -> new UserDto(
                        user1.getStaffId(),
                        user1.getName(),
                        user1.getDepartment(),
                        user1.getTeam(),
                        user1.getRole(),
                        user1.getPhoto(),
                        user1.getId()
                ))
                .collect(Collectors.toList());

        model.addAttribute("userGroups", userGroups);
        Groups group = groupService.getGroupById(groupId);
        model.addAttribute("group",group);
        UserDto userDto=new UserDto(user.getStaffId(),user.getPhoto(),user.getDepartment(),user.getTeam(),user.getRole(),user.getPhoto(), user.getId());
        model.addAttribute("user",userDto);
        model.addAttribute("userList",userList);
        return "group";
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("Admin"));
    }
    //Char Char :3

    @GetMapping("/group-chat")
    public String groupChat(Model model){
        Authentication auth=SecurityContextHolder.getContext().getAuthentication();
        User user=userService.findByStaffId(auth.getName());
        if(passwordEncoder.matches("123@dat",user.getPassword())){

            return "redirect:/password";
        }
        List<Groups> userGroups = user.getGroups();
        System.out.println("User Groups: " + userGroups);
        userGroups = userGroups.stream()
                .filter(Groups::isStatus)
                .collect(Collectors.toList());
        model.addAttribute("user",user);
        model.addAttribute("page","groupchat");
        model.addAttribute("userGroups", userGroups);
        return "groupchat";
    }

 // kym start //
 @GetMapping("/gp")
 public ResponseEntity<List<GroupsDto>> findGroupByUserId() {

     String staffId= SecurityContextHolder.getContext().getAuthentication().getName();
     User user=userService.findByStaffId(staffId);
     int userId = user.getId();

     List<Groups> groupsList = groupRepository.groupShow(userId);
     List<GroupsDto> groupsDtos= groupsList.stream().map(groups -> new GroupsDto(groups.getId(),groups.getName(),groups.getPhoto(),groups.isStatus()
     )).collect(Collectors.toList());
     System.out.println("gp list" + groupsList); // This line helps to debug
     return ResponseEntity.status(HttpStatus.OK).body(groupsDtos);
 }

// kym end //



}
