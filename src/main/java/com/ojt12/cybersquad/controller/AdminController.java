package com.ojt12.cybersquad.controller;

import com.ojt12.cybersquad.model.Groups;
import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    private UserService userService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @GetMapping("/dashboard")
    public String dashBoard(Model model){

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserStaffId = authentication.getName();
        User currentUser = userService.findByStaffId(currentUserStaffId);
        if(passwordEncoder.matches("123@dat",currentUser.getPassword())){

            return "redirect:/password";
        }
        List<Groups> userGroups = currentUser.getGroups();
        System.out.println("User Groups: " + userGroups);
        userGroups = userGroups.stream()
                .filter(Groups::isStatus)
                .collect(Collectors.toList());
        model.addAttribute("user",currentUser);
        model.addAttribute("page","dashboard");
        model.addAttribute("userGroups", userGroups);
        return "/admin/dashboard";
    }
}

