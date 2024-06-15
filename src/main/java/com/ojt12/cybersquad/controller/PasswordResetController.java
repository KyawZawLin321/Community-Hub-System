package com.ojt12.cybersquad.controller;

import com.ojt12.cybersquad.model.PasswordResetToken;
import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.repository.PasswordResetTokenRepository;
import com.ojt12.cybersquad.service.EmailService;
import com.ojt12.cybersquad.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import java.time.LocalDateTime;

@Controller
public class PasswordResetController {

    @Autowired
    EmailService emailService;
    @Autowired
    UserService userService;
    @Autowired
    PasswordResetTokenRepository tokenRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @GetMapping("/forgotPassword")
    public String forgotPassword() {
        return "forgotPassword";
    }

    @PostMapping("/sendEmail")
    public String forgotPasswordProcess(@ModelAttribute User user, Model model) {
        User getUser = userService.getUserByEmail(user.getEmail());
        if (getUser != null) {
            String output = emailService.sendEmail(getUser);
            if (output.equals("success")) {
                return "redirect:/forgotPassword?success=true";
            }
        } else {
            model.addAttribute("errorMessage", "User with this email cannot be found");
        }
        return "redirect:/forgotPassword?error=true";
    }

    @GetMapping("/resetPassword/{token}")
    public String resetPasswordForm(@PathVariable String token, ModelMap model) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token);
        if (resetToken != null && !hasExpired(resetToken.getExpiryDateTime())) {
            model.addAttribute("email", resetToken.getUser().getEmail());
            return "resetPassword";
        } else {
            model.addAttribute("errorMessage", "Invalid or expired token received");
            return "redirect:/forgotPassword?error";
        }
    }

    @PostMapping("/resetPassword")
    public String passwordResetProcess(@ModelAttribute User userDTO) {
        User user = userService.getUserByEmail(userDTO.getEmail());
        if(user != null) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
            userService.save(user);
            return "redirect:/login";
        } else {
            return "redirect:/forgotPassword?error";
        }
    }

    private boolean hasExpired(LocalDateTime expiryDateTime) {
        return LocalDateTime.now().isAfter(expiryDateTime);
    }
}

