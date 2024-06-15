package com.ojt12.cybersquad.repository;

import com.ojt12.cybersquad.model.PasswordResetToken;
import com.ojt12.cybersquad.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Integer> {

    PasswordResetToken findByToken(String token);

    void deleteByUser(User user);


    PasswordResetToken findByUser(User user);
}

