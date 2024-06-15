package com.ojt12.cybersquad.service;

import com.ojt12.cybersquad.dto.GuidelineDto;
import com.ojt12.cybersquad.model.Guideline;
import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.repository.GuidelineRepository;
import com.ojt12.cybersquad.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class GuidelineService {
    @Autowired
    private GuidelineRepository guidelineRepository;

    @Autowired
    private UserRepository userRepository;

    //Char Char :3

    public Guideline createGuideline(Guideline guideline, User currentUser) {
        LocalDateTime now = LocalDateTime.now();
        guideline.setCreatedDate(now);
        guideline.setUpdatedDate(now);
        guideline.setCreatedBy(currentUser.getName());
        guideline.setRole(currentUser.getRole().toString());
        return guidelineRepository.save(guideline);
    }

    public List<Guideline> getAllGuidelines() {
        return guidelineRepository.findAll();
    }

    public Guideline getGuidelineById(int id) {
        return guidelineRepository.findById(id).orElse(null);
    }

    public Guideline updateGuideline(Guideline guideline,String updatedByName) {
        Guideline existingGuideline = guidelineRepository.findById(guideline.getId()).orElse(null);
        if (existingGuideline != null) {
            existingGuideline.setTitle(guideline.getTitle());
            existingGuideline.setDescription(guideline.getDescription());
            existingGuideline.setPhoto(guideline.getPhoto());
            existingGuideline.setUpdatedDate(LocalDateTime.now());
            existingGuideline.setUpdatedBy(updatedByName);

            return guidelineRepository.save(existingGuideline);
        }
        return null;
    }

    public long countGuidelines() {
        return guidelineRepository.count();
    }

    public Guideline getSomeGuideline() {
        List<Guideline> guidelines = guidelineRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        if (!guidelines.isEmpty()) {
            return guidelines.get(0);
        } else {
            return null;
        }
    }

    @Transactional
    public void deleteGuidelineById(int id) {
        guidelineRepository.deleteById(id);
    }

    public List<GuidelineDto> getGuidelineHistory(int id) {
        List<Guideline> guidelines = guidelineRepository.findGuidelineHistoryById(id);
        List<GuidelineDto> guidelineDtoList = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

        for (Guideline guideline : guidelines) {
            String createdDateStr = guideline.getCreatedDate().format(formatter);
            String updatedDateStr = guideline.getUpdatedDate() != null ? guideline.getUpdatedDate().format(formatter) : null;

            GuidelineDto guidelineDto = new GuidelineDto(
                    guideline.getId(),
                    guideline.getTitle(),
                    guideline.getDescription(),
                    guideline.getPhoto(),
                    guideline.getUser().getId(),
                    false,
                    guideline.getCreatedDate(),
                    guideline.getUpdatedDate(),
                    guideline.getCreatedBy(),
                    guideline.getUpdatedBy(),
                    guideline.getRole()
            );

            guidelineDtoList.add(guidelineDto);
        }

        return guidelineDtoList;
    }
}
//Char Char :3

