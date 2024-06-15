package com.ojt12.cybersquad.controller;

import com.ojt12.cybersquad.dto.GuidelineDto;
import com.ojt12.cybersquad.dto.UserDto;
import com.ojt12.cybersquad.model.Groups;
import com.ojt12.cybersquad.model.Guideline;
import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.service.AppUserDetailService;
import com.ojt12.cybersquad.service.GuidelineService;
import com.ojt12.cybersquad.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
/*KZL*/

@Controller
public class LoginController {

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserService userService;
    @Autowired
    private GuidelineService guidelineService;

    /*Login Page*/
    @GetMapping("/login")
    public ModelAndView login(Model model){
        return new ModelAndView("login");
    }

    @GetMapping("/home")
    public ModelAndView home(Model model, HttpSession session){
        Authentication auth= SecurityContextHolder.getContext().getAuthentication();
        if(auth !=null && auth.getAuthorities().stream().anyMatch(a->a.getAuthority().equals(User.Role.Admin.name()) || a.getAuthority().equals(User.Role.User.name()))) {
            User user=  userService.findByStaffId(auth.getName());
            if(passwordEncoder.matches("123@dat",user.getPassword())){

                return new ModelAndView("redirect:/password");
            }else{
                if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(User.Role.Admin.name()))) {
                    return new ModelAndView("redirect:/admin/dashboard");
                } else if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(User.Role.User.name()))) {
                        Guideline guideline = guidelineService.getSomeGuideline();
                        GuidelineDto guidelineDto=new GuidelineDto(guideline.getId(),guideline.getTitle(),guideline.getDescription(),guideline.getPhoto(),guideline.getUser().getId(),user.isGuidelineSeen(),guideline.getCreatedDate(),guideline.getUpdatedDate(),guideline.getCreatedBy(),guideline.getUpdatedBy(),guideline.getRole());
                    List<Groups> userGroups = user.getGroups();
                    userGroups = userGroups.stream()
                            .filter(Groups::isStatus)
                            .collect(Collectors.toList());
                    model.addAttribute("userGroups", userGroups);
                        model.addAttribute("guideline", guidelineDto);
                        UserDto userDto=new UserDto(user.getStaffId(),user.getPhoto(),user.getDepartment(),user.getTeam(),user.getRole(),user.getPhoto(), user.getId(),user.getAccept());
                        return new ModelAndView("home", "user", userDto);
                }
            }
        }
        return new ModelAndView("redirect:/login");
    }
    //Char Char
    @PostMapping("/updateGuidelineSeen")
    @ResponseBody
    public String updateGuidelineSeen() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            String username = auth.getName();
            User user = userService.findByStaffId(username);
            if (user != null) {
                user.setGuidelineSeen(true);
                userService.save(user);
                return "success";
            }
        }
        return "error";
    }
    //Char Char

    @GetMapping("/password")
    public ModelAndView password(Model model){
        return new ModelAndView("/user/changepassword","user",new User());

    }
    /*Change Password*/
    @PostMapping("/changepassword")
    public String changePassword(@ModelAttribute User user,Model model,RedirectAttributes ra){
        Authentication auth= SecurityContextHolder.getContext().getAuthentication();
        User user1=userService.findByStaffId(auth.getName());
        if(passwordEncoder.matches(user.getPassword(), user1.getPassword())){
            if(user.getNewPassword().equals(user.getConfirmPassword())){
                user1.setPassword(passwordEncoder.encode(user.getNewPassword()));
                userService.save(user1);
                if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(User.Role.Admin.name()))) {
                    return "redirect:/admin/dashboard";
                }else{
                    return "redirect:/post";
                }
            }else{
                return "redirect:/password";
            }
        }else{
            ra.addFlashAttribute("error","Your old password is incorrect!!!");
            return "redirect:/password";
        }

    }
   /* @PostMapping("/changepassword-profile")
    public String changePasswordProfile(@ModelAttribute User user,Model model,RedirectAttributes ra){
        Authentication auth= SecurityContextHolder.getContext().getAuthentication();
        User user1=userService.findByStaffId(auth.getName());
        if(passwordEncoder.matches(user.getPassword(), user1.getPassword())){
            if(user.getNewPassword().equals(user.getConfirmPassword())){
                user1.setPassword(passwordEncoder.encode(user.getNewPassword()));
                userService.save(user1);
                return "redirect:/user/viewprofile";
            }else {
                ra.addFlashAttribute("error","Your New Password and Confirm Password is incorrect");
                return "redirect:/user/viewprofile";
            }
        }else{
            ra.addFlashAttribute("error","Your old password is incorrect!!!");
            return "redirect:/user/viewprofile";
        }

    }*/

   /*Change Password*/
   @PostMapping("/changepassword-profile")
   @ResponseBody
   public Map<String, String> changePasswordProfile(@ModelAttribute User user) {
       Map<String, String> response = new HashMap<>();
       Authentication auth = SecurityContextHolder.getContext().getAuthentication();
       User user1 = userService.findByStaffId(auth.getName());

       if (!passwordEncoder.matches(user.getPassword(), user1.getPassword())) {
           response.put("error", "Your old password is incorrect!!!");
           return response;
       }

       if (!user.getNewPassword().equals(user.getConfirmPassword())) {
           response.put("error", "Your New Password and Confirm Password do not match.");
           return response;
       }

       user1.setPassword(passwordEncoder.encode(user.getNewPassword()));
       userService.save(user1);
       response.put("success", "Password changed successfully.");

       return response;
   }

    @GetMapping("/post")
    public String post(Model model){
        Authentication auth= SecurityContextHolder.getContext().getAuthentication();
        User user=userService.findByStaffId(auth.getName());
        if(passwordEncoder.matches("123@dat",user.getPassword())){

            return "redirect:/password";
        }
        List<Groups> userGroups = user.getGroups();
        userGroups = userGroups.stream()
                .filter(Groups::isStatus)
                .collect(Collectors.toList());
        model.addAttribute("userGroups", userGroups);
        UserDto userDto=new UserDto(user.getStaffId(),user.getPhoto(),user.getDepartment(),user.getTeam(),user.getRole(),user.getPhoto(), user.getId(),user.getAccept());
        model.addAttribute("user",userDto);

        Guideline guideline = guidelineService.getSomeGuideline();
        GuidelineDto guidelineDto=new GuidelineDto(guideline.getId(),guideline.getTitle(),guideline.getDescription(),guideline.getPhoto(),guideline.getUser().getId(),user.isGuidelineSeen(),guideline.getCreatedDate(),guideline.getUpdatedDate(),guideline.getCreatedBy(),guideline.getUpdatedBy(),guideline.getRole());
        model.addAttribute("guideline", guidelineDto);
        model.addAttribute("page", "post");
        return "home";
    }

    /*KZL*/

    @GetMapping("/logout")
    public String logout() {
        return "redirect:/login?logout";
    }

}
