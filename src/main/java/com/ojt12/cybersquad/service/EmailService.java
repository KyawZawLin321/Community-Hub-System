package com.ojt12.cybersquad.service;

import com.ojt12.cybersquad.model.PasswordResetToken;
import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class EmailService {

    @Autowired
    JavaMailSender javaMailSender;

    @Autowired
    PasswordResetTokenRepository tokenRepository;
    public String sendEmail(User user) {
        try {
            String resetLink = generateResetToken(user);
            if (resetLink.isEmpty()) {
                return "error";
            }

            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom("soewaimoe2@gmail.com");
            msg.setTo(user.getEmail());

            msg.setSubject("Password Reset Request");
            msg.setText("Hello " + user.getName() + ",\n\n"
                    + "You have requested to reset your password. Please click on the following link to reset your password:\n"
                    + resetLink + "\n\n"
                    + "If you did not request this, please ignore this email.\n\n"
                    + "Regards,\n"
                    + "YourAppName Team");

            javaMailSender.send(msg);

            return "success";
        } catch (Exception e) {
            e.printStackTrace();
            return "error";
        }
    }

    public String generateResetToken(User user) {
        try {
            PasswordResetToken existingToken = tokenRepository.findByUser(user);
            if (existingToken != null) {
                existingToken.setExpiryDateTime(LocalDateTime.now().plusMinutes(30)); // Extend expiry time
                tokenRepository.save(existingToken);
                return createResetLink(existingToken.getToken());
            } else {
                String token = UUID.randomUUID().toString();
                LocalDateTime expiryDateTime = LocalDateTime.now().plusMinutes(30); // 30 minutes expiry
                PasswordResetToken newToken = new PasswordResetToken();
                newToken.setToken(token);
                newToken.setUser(user);
                newToken.setExpiryDateTime(expiryDateTime);
                tokenRepository.save(newToken);
                return createResetLink(token);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    private String createResetLink(String token) {
        return "http://localhost:8080/resetPassword/" + token;
    }

    public boolean hasExpired(LocalDateTime expiryDateTime) {
        return LocalDateTime.now().isAfter(expiryDateTime);
    }
}
