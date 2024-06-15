package com.ojt12.cybersquad.repository;

import com.ojt12.cybersquad.model.Guideline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

//Char Char :3
public interface GuidelineRepository extends JpaRepository<Guideline,Integer> {
    long count();
    List<Guideline> findByIdOrderByUpdatedDateDesc(int id);
    List<Guideline> findGuidelineHistoryById(int id);
}
