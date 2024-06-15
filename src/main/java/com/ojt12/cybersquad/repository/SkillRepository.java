package com.ojt12.cybersquad.repository;

import com.ojt12.cybersquad.model.Share;
import com.ojt12.cybersquad.model.Skill;
import com.ojt12.cybersquad.model.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

// kym //

public interface SkillRepository extends JpaRepository<Skill, Integer> {

    @Transactional
    void deleteByUser(User user);

    @Transactional
    void deleteByUserId(int id);

}
// kym //