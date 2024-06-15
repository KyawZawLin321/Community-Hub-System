package com.ojt12.cybersquad.controller;

import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.repository.UserRepository;
import com.ojt12.cybersquad.service.CloudinaryImgService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AppUserInitializer {
    /*KZL*/

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private CloudinaryImgService cloudinaryImgService;
    @EventListener(classes = ContextRefreshedEvent.class)
    /* Default Admin */
    public void initializerUser() {
        if (userRepo.count() == 0) {
            User user = new User();
            user.setId(999);
            user.setDivision("BOD/Expatriates");
            user.setDoorLogId(77000);
            user.setTeam("BOD-ACE");
            user.setStaffId("99-00000");
            user.setDepartment("Management Division");
            user.setEmail("dat@gmail.com");
            user.setName("Dat");
            user.setPassword(passwordEncoder.encode("123@dat"));
            user.setCreateDate("20-9-2001");
            user.setStatus(true);
            user.setRole(User.Role.Admin);
            userRepo.save(user);
        }

    }
/*KZL*/

}