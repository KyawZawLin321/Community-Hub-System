package com.ojt12.cybersquad.controller;

import com.ojt12.cybersquad.dto.GuidelineDto;
import com.ojt12.cybersquad.model.Content;
import com.ojt12.cybersquad.model.Groups;
import com.ojt12.cybersquad.model.Guideline;
import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.repository.GuidelineRepository;
import com.ojt12.cybersquad.repository.UserRepository;
import com.ojt12.cybersquad.service.CloudinaryImgService;
import com.ojt12.cybersquad.service.GuidelineService;
import com.ojt12.cybersquad.service.UserService;
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

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

//Char Char :3
@Controller
@RequestMapping("/guideline")
public class GuidelineController {
    @Autowired
    private GuidelineService guidelineService;
    @Autowired
    private CloudinaryImgService cloudinaryImgService;
    @Autowired
    private UserService userService;
    @Autowired
    private GuidelineRepository guidelineRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @GetMapping("/create")
    public String createGuidelinePage(Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserStaffId = authentication.getName();
        User user=userService.findByStaffId(currentUserStaffId);
        if(passwordEncoder.matches("123@dat",user.getPassword())){

            return "redirect:/password";
        }
        List<Groups> userGroups = user.getGroups();
        userGroups = userGroups.stream()
                .filter(Groups::isStatus)
                .collect(Collectors.toList());

        if (user.getRole() == User.Role.Admin) {
            model.addAttribute("guideline", new Guideline());

            boolean hasExistingGuidelines = guidelineService.countGuidelines() > 0;
            model.addAttribute("hasExistingGuidelines", hasExistingGuidelines);

            List<Guideline> allGuidelines = guidelineService.getAllGuidelines();
            model.addAttribute("allGuidelines", allGuidelines);
            model.addAttribute("user", user);
            model.addAttribute("userGroups", userGroups);
            model.addAttribute("page", "guideline");
            return "/admin/createGuideline";
        } else {
            return "redirect:/access-denied";
        }
    }

    @PostMapping("/create")
    public String createGuideline(@ModelAttribute Guideline guideline,
                                  @RequestParam("photoFile") MultipartFile photoFile) throws IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserStaffId = authentication.getName();

        User currentUser = userService.findByStaffId(currentUserStaffId);

        if (currentUser.getRole() == User.Role.Admin) {
            try {
                String photoUrl = cloudinaryImgService.uploadFile(photoFile);
                guideline.setPhoto(photoUrl);

                guideline.setUser(currentUser);

                guidelineService.createGuideline(guideline,currentUser);
                return "redirect:/guideline/allGuideline";
            } catch (Exception e) {
                e.printStackTrace();
                return "redirect:/guideline/create?error";
            }
        } else {
            return "redirect:/access-denied";
        }
    }

    @GetMapping("/allGuideline")
    public String getAllGuidelines(Model model) {
        List<Guideline> allGuidelines = guidelineService.getAllGuidelines();
        model.addAttribute("allGuidelines", allGuidelines);
        return "redirect:/guideline/create";
    }

@PostMapping("/update/{guidelineId}")
public ResponseEntity<?> updateGuideline(@PathVariable Integer guidelineId,
                                         @RequestParam("title") String title,
                                         @RequestParam("description") String description,
                                         @RequestParam(value = "photoFile", required = false) MultipartFile photoFile) {
    Guideline existingGuideline = guidelineService.getGuidelineById(guidelineId);
    if (existingGuideline == null) {
        return ResponseEntity.notFound().build();
    }
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (!isAdmin(authentication)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
    try {
        if (photoFile != null && !photoFile.isEmpty()) {
            String photoUrl = cloudinaryImgService.uploadFile(photoFile);
            existingGuideline.setPhoto(photoUrl);
        }
        User user=userService.findByStaffId(authentication.getName());
        existingGuideline.setTitle(title);
        existingGuideline.setDescription(description);
        existingGuideline.setUpdatedBy(user.getName());
        existingGuideline.setUpdatedDate(LocalDateTime.now());
        Guideline updatedGuideline = guidelineService.updateGuideline(existingGuideline, user.getName());

        if (updatedGuideline != null) {
            return ResponseEntity.ok().body("Guideline updated successfully");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update guideline.");
        }
    } catch (IOException e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update guideline.");
    }
}


    @PostMapping("/delete/{guidelineId}")
    public ResponseEntity<?> deleteGuideline(@PathVariable int guidelineId) {
               Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

            guidelineService.deleteGuidelineById(guidelineId);
            System.out.println(guidelineId);
            System.out.println("delete guideline");
            return ResponseEntity.ok().body("Guideline deleted successfully");

    }


    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("Admin"));
    }

    @GetMapping("/history/{id}")
    @ResponseBody
    public ResponseEntity<List<GuidelineDto>> getGuidelineHistory(@PathVariable int id) {
        List<GuidelineDto> guidelineHistory = guidelineService.getGuidelineHistory(id);
        return ResponseEntity.ok().body(guidelineHistory);
    }
//    public String formatDate(LocalDateTime date) {
//        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy"); // Format as "30 May 2024"
//        return date.format(formatter);
//    }
}
//Char Char :3