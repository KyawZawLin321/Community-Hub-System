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
import org.springframework.web.bind.annotation.PathVariable;
import org.thymeleaf.model.IModel;

import java.util.List;
import java.util.stream.Collectors;

@Controller
public class PageController {
    @Autowired
    private UserService userService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @GetMapping("/create")
    public String userPage(){
        return "contentCreate";
    }

    @GetMapping("/kym")
    public String kym(Model model){
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
        return "savePost";
    }



    /*STRM*/

    @GetMapping("/event")
    public String eventPage(Model model){
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
        model.addAttribute("role",authentication.getAuthorities());
        System.out.println(authentication.getAuthorities());
        model.addAttribute("user", currentUser);
        model.addAttribute("userGroups", userGroups);
        model.addAttribute("page","event");
        return "admin/event";
    }

    @GetMapping("/analysis")
    public String getAnalysisPage(Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserStaffId = authentication.getName();
        User currentUser = userService.findByStaffId(currentUserStaffId);
        if(passwordEncoder.matches("123@dat",currentUser.getPassword())){

            return "redirect:/password";
        }
        model.addAttribute("user",currentUser);
        return "/user/analysis";
    }

    /*STRM*/



    @GetMapping("/hobby")
    public String hobbyPage(){
        return "test";
    }

}
