package com.ojt12.cybersquad.controller;

import com.ojt12.cybersquad.dto.ContentDto;
import com.ojt12.cybersquad.dto.UserDto;
import com.ojt12.cybersquad.dto.UserResponse;
import com.ojt12.cybersquad.model.*;
import com.ojt12.cybersquad.repository.SkillRepository;
import com.ojt12.cybersquad.repository.UserRepository;
import com.ojt12.cybersquad.service.*;
import com.sun.security.auth.UserPrincipal;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

import java.io.IOException;
import java.security.Principal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/*KZL*/
@Controller
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    public ExcelUploadService excelUploadService;
    @Autowired
    private CloudinaryImgService cloudinaryImgService;
    @Autowired
    private GroupService groupService;
    @Autowired
    private EventService eventService;
    @Autowired
    private ContentService contentService;
    @Autowired
    private SkillRepository skillRepository;
    @Autowired
    private RemarkService remarkService;

    @Autowired
    private CommentService commentService;

    @Autowired
    private ShareService shareService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    /*User Profile View*/
    @GetMapping("/viewprofile")
    public ModelAndView viewProfile(Model model, HttpSession session){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserStaffId = authentication.getName();
        User currentUser = userService.findByStaffId(currentUserStaffId);
        if(passwordEncoder.matches("123@dat",currentUser.getPassword())){

            return new ModelAndView ("redirect:/password");
        }
        List<Groups> userGroups = currentUser.getGroups();
        System.out.println("User Groups: " + userGroups);
        userGroups = userGroups.stream()
                .filter(Groups::isStatus)
                .collect(Collectors.toList());
        model.addAttribute("user", currentUser);
        model.addAttribute("userGroups", userGroups);
        model.addAttribute("page","profile");
        return new ModelAndView("user/userprofile","user1",new User());
    }
//    @GetMapping("/get-user-info")
//    @ResponseBody
//    public ResponseEntity<UserDto> getUserInfo(){
//        String staffId= SecurityContextHolder.getContext().getAuthentication().getName();
//        User user=userService.findByStaffId(staffId);
//        UserDto userDto=new UserDto(user.getStaffId(),user.getName(),user.getDepartment(),user.getTeam(),user.getRole(),user.getPhoto(),user.getId(),user.getInterest(),user.getDob(),user.getSkill(),user.getBiography(),user.getEmail(),user.getCoverPhoto());
//        return ResponseEntity.ok(userDto);
//    }

    //kym//
    @GetMapping("/get-user-info")
    @ResponseBody
    public ResponseEntity<UserDto> getUserInfo() {
        String staffId = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByStaffId(staffId);

        // Retrieve the skill options for the user
        List<String> skillOptions = userService.getSkillOptionsForUser(user);

        // Create a UserDto object with all user information including skill options
        UserDto userDto = new UserDto(
                user.getStaffId(),
                user.getName(),
                user.getDepartment(),
                user.getTeam(),
                user.getRole(),
                user.getPhoto(),
                user.getId(),
                user.getInterest(),
                user.getDob(),
                user.getSkill(),
                user.getBiography(),
                user.getEmail(),
                user.getCoverPhoto()
        );

        // Set the skill options in the UserDto object
        userDto.setSkillOption(skillOptions);

        return ResponseEntity.ok(userDto);
    }
    //kym//

    @PostMapping("/updateUserRole")
    @ResponseBody
    public ResponseEntity<String> updateUserRole(@RequestBody UserDto userDto) {
        User existingUser = userService.findByStaffId(userDto.getStaffId());
        if (existingUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        if (userDto.getRole().equals(User.Role.User)) {
            existingUser.setRole(User.Role.User);
            existingUser.setReason(userDto.getReason());
            existingUser.setAccept(false);
            userService.save(existingUser);
            return ResponseEntity.ok("Role change to User is pending acceptance with reason");
        } else if (userDto.getRole().equals(User.Role.Admin)) {
            existingUser.setPendingRole(User.Role.Admin);
            existingUser.setReason(userDto.getReason());
            existingUser.setAccept(false);
            userService.save(existingUser);
            return ResponseEntity.ok("Role change to Admin is pending acceptance");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid role change");
        }
    }
    @GetMapping("/me")
    public ResponseEntity<UserDto> getUserDetails(Principal principal) {
        User user = userService.findByStaffId(principal.getName());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setRole(user.getRole());
        userDto.setPendingRole(String.valueOf(user.getPendingRole()));
        userDto.setAccept(user.getAccept());
        userDto.setReason(user.getReason());
        userDto.setReasonModalDisplayed(user.getReasonModalDisplayed());
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/acceptRole")
    @ResponseBody
    public ResponseEntity<Map<String, String>> acceptRole(@RequestBody UserDto userDto) {
        String staffId = SecurityContextHolder.getContext().getAuthentication().getName();
        User existingUser = userService.findByStaffId(staffId);

        if (existingUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", "User not found"));
        }

        if (existingUser.getPendingRole() != null) {
            existingUser.setRole(existingUser.getPendingRole());
            existingUser.setPendingRole(null);
            existingUser.setAccept(true);
            userService.save(existingUser);

            Map<String, String> responseData = new HashMap<>();
            responseData.put("message", "User role updated successfully");
            responseData.put("reason", existingUser.getReason());

            return ResponseEntity.ok(responseData);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap("error", "No pending role to accept"));
        }
    }

    @PostMapping("/declineRole")
    @ResponseBody
    public ResponseEntity<Map<String, String>> declineRole(@RequestBody UserDto userDto) {
        String staffId = SecurityContextHolder.getContext().getAuthentication().getName();
        User existingUser = userService.findByStaffId(staffId);

        if (existingUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", "User not found"));
        }

        existingUser.setPendingRole(null);
        existingUser.setAccept(false);
        userService.save(existingUser);

        Map<String, String> responseData = new HashMap<>();
        responseData.put("message", "User role decline processed successfully");

        return ResponseEntity.ok(responseData);
    }

    /*Display User List*/
    @GetMapping("/getUsers")
    @ResponseBody
    public ResponseEntity<List<UserDto>> getCustomers(){
        List<User>users=userService.findByStatus(true);
        List<UserDto> userDtos = users.stream()
                .map(user -> new UserDto(
                        user.getStaffId(),
                        user.getName(),
                        user.getDepartment(),
                        user.getTeam(),
                        user.getRole(),
                        user.getPhoto(),
                        user.getId(),
                        user.getCreateDate()
                ))
                .collect(Collectors.toList());
        return  ResponseEntity.ok(userDtos);
    }
    /*Ban User*/
    @DeleteMapping("/deleteUser/{id}")
    @ResponseBody
    public ResponseEntity<String> deleteUser(@PathVariable String id) {
        User existingUser = userService.findByStaffId(id);
        existingUser.setStatus(false);
        // Delete the user
        userService.save(existingUser);

        return ResponseEntity.ok("User deleted successfully");
    }
    /*Upload User Profile */
    @PostMapping("/upload-user-profile")
    @ResponseBody
    public ResponseEntity<String> uploadUserProfile(@RequestParam("file") MultipartFile file) throws IOException {
        String staffId= SecurityContextHolder.getContext().getAuthentication().getName();

        User userExist = userService.findByStaffId(staffId);
        String fileUrl = cloudinaryImgService.uploadFile(file);
        userExist.setPhoto(fileUrl);
        userService.save(userExist);
        return ResponseEntity
                .ok(fileUrl);
    }
    /*Upload User Cover Profile*/
    @PostMapping("/upload-cover-profile")
    @ResponseBody
    public ResponseEntity<String> uploadCoverProfile(@RequestParam("file") MultipartFile file) throws IOException {
        String staffId= SecurityContextHolder.getContext().getAuthentication().getName();

        User userExist = userService.findByStaffId(staffId);
        String fileUrl = cloudinaryImgService.uploadFile(file);
        userExist.setCoverPhoto(fileUrl);
        userService.save(userExist);
        return ResponseEntity
                .ok(fileUrl);
    }


    @PostMapping("/update-user-info")
    @ResponseBody
    public ResponseEntity<UserDto> updateUserInfo(@RequestBody UserDto user) {
        String staffId = SecurityContextHolder.getContext().getAuthentication().getName();
        User existingUser = userService.findByStaffId(staffId);

        existingUser.setName(user.getName());
        existingUser.setDob(user.getDob());
        existingUser.setBiography(user.getBiography());
        existingUser.setInterest(user.getInterest());
        existingUser.setSkill(user.getSkill());

        // Save user to get the updated user with an ID
        User savedUser = userService.save(existingUser);

        // Delete existing skillOption entries
        skillRepository.deleteByUser(savedUser);

        // Add new skill options
        List<String> skillOption = user.getSkillOption();
        if (skillOption != null) {
            for (String skillName : skillOption) {
                Skill skill = new Skill();
                skill.setSkillOption(skillName);
                skill.setStatus(true);
                skill.setUser(savedUser); // Use the saved user with an ID
                skillRepository.save(skill);
            }
        }

        // Create UserDto from the updated user
        UserDto userDto = new UserDto(
                savedUser.getStaffId(),
                savedUser.getName(),
                savedUser.getDepartment(),
                savedUser.getTeam(),
                savedUser.getRole(),
                savedUser.getPhoto(),
                savedUser.getId(),
                savedUser.getInterest(),
                savedUser.getDob(),
                savedUser.getSkill(),
                savedUser.getBiography(),
                savedUser.getEmail(),
                savedUser.getCoverPhoto()
        );

        return ResponseEntity.ok(userDto);
    }



    @GetMapping("/userprofile")
    public ModelAndView showUserProfile(@RequestParam("staffId") String staffId,Model model) {
        User user =userService.findByStaffId(staffId);

        Authentication auth=SecurityContextHolder.getContext().getAuthentication();
        User user1=userService.findByStaffId(auth.getName());
        List<String> skillOptions = userService.getSkillOptionsForUser(user);

        // Create a UserDto object with all user information including skill options
        UserDto userDto = new UserDto(
                user.getStaffId(),
                user.getName(),
                user.getDepartment(),
                user.getTeam(),
                user.getRole(),
                user.getPhoto(),
                user.getId(),
                user.getInterest(),
                user.getDob(),
                user.getSkill(),
                user.getBiography(),
                user.getEmail(),
                user.getCoverPhoto()
        );
        // Set the skill options in the UserDto object
        userDto.setSkillOption(skillOptions);
        model.addAttribute("user1",user1);
        return new ModelAndView("user/searchprofile", "user", userDto);
    }
    @GetMapping("/searchgroup")
    public ModelAndView searchGroup(@RequestParam("groupId") int groupId,Model model) {
        Groups groups=groupService.findGroupsById(groupId);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByStaffId(authentication.getName());
        if(passwordEncoder.matches("123@dat",currentUser.getPassword())){
            return new ModelAndView("redirect:/password");
        }
        model.addAttribute("user",currentUser);
        return new ModelAndView("user/searchgroup", "group", groups);
    }
    @GetMapping("/searchevent")
    public ModelAndView searchEvent(@RequestParam("eventId") int eventId,Model model) {
        String staffId = SecurityContextHolder.getContext().getAuthentication().getName();
        User existingUser = userService.findByStaffId(staffId);
        if(passwordEncoder.matches("123@dat",existingUser.getPassword())){
            return new ModelAndView("redirect:/password");
        }
        Event event =eventService.findEventById(eventId);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
        String formattedStartDate = event.getStartDate().format(formatter);
        System.out.println(formattedStartDate);
        model.addAttribute("formattedStartDate", formattedStartDate);

        model.addAttribute("user",existingUser);
        return new ModelAndView("user/searchevent", "event", event);
    }
    @GetMapping("/searchcontent")
    public ModelAndView searchContent(@RequestParam("contentId") int contentId,HttpSession session) {
        Authentication auth= SecurityContextHolder.getContext().getAuthentication();
        User user=  userService.findByStaffId(auth.getName());

        session.setAttribute("contentId",contentId);
        return new ModelAndView("user/searchcontent", "user", user);
    }

    /*Trending post*/
    @GetMapping("/reportContent/{contentId}")
    @ResponseBody
    public ResponseEntity<ContentDto> getReportContentById(@PathVariable int contentId) {

        Content content=contentService.findSearchContentById(contentId);
        content.setUserId(content.getUser().getId());
        content.setPhoto(content.getUser().getPhoto());
        content.setName(content.getUser().getName());
        content.setStaffId(content.getUser().getStaffId());
        int likeCount = remarkService.getLikeCount(contentId);

        content.setLikeCount(likeCount);
        List<Resource> resources = content.getResources();
        content.setImageUrls(resources);
        content.setVideoUrls(resources);
        ContentDto contentDto=new ContentDto(content.getId(),content.getText(),content.getIsPublic(),content.getCreatedDate(),content.getUpdatedDate(),content.isStatus(), content.getImageUrls(), content.getVideoUrls(),content.getUserId(),content.getLikeCount(),content.getPhoto(),content.getName(),content.getStaffId());
        return ResponseEntity.status(HttpStatus.OK).body(contentDto);
    }
    /*STRM*/

    @GetMapping("/search/content")
    @ResponseBody
    public ResponseEntity<ContentDto> getContentById(HttpSession session) {
       int contentId= (int) session.getAttribute("contentId");
        System.out.println("content :"+contentId);

        Content content=contentService.findSearchContentById(contentId);
        content.setUserId(content.getUser().getId());
        System.out.println(content.getLikeCount());
        List<Resource> resources = content.getResources();
        content.setImageUrls(resources);
        content.setVideoUrls(resources);
        ContentDto contentDto=new ContentDto(content.getId(),content.getText(),content.getIsPublic(),content.getCreatedDate(),content.getUpdatedDate(),content.isStatus(), content.getImageUrls(), content.getVideoUrls(),content.getUserId(),content.getLikeCount());
        return ResponseEntity.status(HttpStatus.OK).body(contentDto);
    }
    /*KZL*/

    // kym //
    @GetMapping("/users/{userId}")
    @ResponseBody
    public ResponseEntity<UserDto> getUserById(@PathVariable int userId) {
        Optional<User> userOptional = userService.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            UserDto userDto = new UserDto(
                    user.getStaffId(),
                    user.getName(),
                    user.getDepartment(),
                    user.getTeam(),
                    user.getRole(),
                    user.getPhoto(),
                    user.getId()
            );
            return ResponseEntity.ok(userDto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/share-user/{userId}")
    @ResponseBody
    public ResponseEntity<UserDto> share(@PathVariable int userId) {
        Optional<User> userOptional = userService.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            UserDto userDto = new UserDto(
                    user.getStaffId(),
                    user.getName(),
                    user.getDepartment(),
                    user.getTeam(),
                    user.getRole(),
                    user.getPhoto(),
                    user.getId()
            );
            return ResponseEntity.ok(userDto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    // kym //
//swm
    @GetMapping("/current-user")
    public ResponseEntity<UserDto> getCurrentUser(Principal principal) {
        User user = userService.findByStaffId(principal.getName());
        System.out.println(user.getId());
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        return ResponseEntity.ok(userDto);
    }
    //swm
    @GetMapping("/line-chart/{userId}")
    @ResponseBody
    public ResponseEntity<Map<String, Map<String, Integer>>> getTotalEngagement(@PathVariable int userId) {
        try {
            Map<String, Map<String, Integer>> data = new HashMap<>();

            Map<String, Integer> likesByDay = remarkService.countLikesByDayOfWeek(userId);
            Map<String, Integer> commentsByDay = commentService.countCommentsByDayOfWeek(userId);
            Map<String, Integer> sharesByDay = shareService.countSharesByDayOfWeek(userId);

            data.put("likes", likesByDay);
            data.put("comments", commentsByDay);
            data.put("shares", sharesByDay);

            return ResponseEntity.ok(data);
        } catch (Exception e) {
            // Log the exception or handle it as needed
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

//    @GetMapping("/search")
//    @ResponseBody
//    public List<UserResponse> searchUsers(@RequestParam("q") String query) {
//        return userService.searchUsers(query);
//    }
@GetMapping("/search")
@ResponseBody
public ResponseEntity<List<Map<String, Object>>> searchUsers(@RequestParam("q") String query) {
    List<UserResponse> users = userService.searchUsers(query);
    List<Map<String, Object>> result = users.stream().map(user -> {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("key", user.getName());
        userMap.put("value", user.getName());
        userMap.put("userId", user.getId());

        return userMap;
    }).collect(Collectors.toList());
    return ResponseEntity.ok(result);
}
@GetMapping("/trash")
 public String trash(Model model){
    Authentication auth= SecurityContextHolder.getContext().getAuthentication();
    User user=  userService.findByStaffId(auth.getName());
    if(passwordEncoder.matches("123@dat",user.getPassword())){
        return "redirect:/password";
    }
    List<Groups> userGroups = user.getGroups();
    userGroups = userGroups.stream()
            .filter(Groups::isStatus)
            .collect(Collectors.toList());
    model.addAttribute("userGroups", userGroups);
    model.addAttribute("user",user);
    model.addAttribute("page","trash");
        return "user/trash";
}

    @PutMapping("/notification-preference/{userId}")
    public ResponseEntity<Void> updatePreference(@PathVariable int userId, @RequestBody Map<String, Boolean> body) {
        boolean notificationsEnabled = body.get("notificationsEnabled");
        userService.updateUserNotificationPreference(userId, notificationsEnabled);
        return ResponseEntity.ok().build();
    }

}
