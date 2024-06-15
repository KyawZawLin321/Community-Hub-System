package com.ojt12.cybersquad.service;

import com.ojt12.cybersquad.dto.ContentDto;
import com.ojt12.cybersquad.dto.UserDto;
import com.ojt12.cybersquad.model.Content;
import com.ojt12.cybersquad.model.Event;
import com.ojt12.cybersquad.model.Groups;
import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.repository.ContentRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

// kym //

@Service
@RequiredArgsConstructor
public class ContentService {

    private final ContentRepository contentRepository;

    public void save(Content content) {
        contentRepository.save(content);
    }

    public List<Content> findAll() {
        return contentRepository.findAll();
    }
    public List<ContentDto> searchContent(String keyword) {
        List<Content> matchingContents = contentRepository.findAll((Specification<Content>) (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            Expression<String> nameWithoutSpaces = criteriaBuilder.function("REPLACE", String.class,
                    criteriaBuilder.lower(root.get("text")),
                    criteriaBuilder.literal(" "),
                    criteriaBuilder.literal(""));

            // Prepare the keyword for matching
            String keywordWithoutSpaces = keyword.toLowerCase().replaceAll(" ", "");

            // Create the LIKE predicate
            predicates.add(criteriaBuilder.like(nameWithoutSpaces, "%" + keywordWithoutSpaces + "%"));
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        });
        matchingContents = matchingContents.stream()
                .filter(content -> content.isStatus())
                .collect(Collectors.toList());

        List<ContentDto> contentDtos = matchingContents.stream()
                .map(content -> new ContentDto(
                        content.getId(),
                        content.getText()
                ))
                .collect(Collectors.toList());
        return contentDtos;
    }

    public Content findSearchContentById(int id){
        return  contentRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Content not found"));
    }

    public Optional<Content> findById(int contentId) {
        return contentRepository.findById(contentId);
    }

    public Optional<Content> findContentById(int contentId) {
        return contentRepository.findById(contentId);
    }




    /*STRM*/

    public int countContentByUserId(int id) {
        return contentRepository.countContentByUserId(id);
    }

    public List<Content> getContentsByUserId(int id) {
        return contentRepository.findByUserIdAndStatus(id);
    }


    /*STRM*/
    public int getContentCountWithinOneWeek(int userId) {
        try {
            int count = contentRepository.countContentWithinOneWeek(userId);
            System.out.println("Content count within one week for user " + userId + ": " + count);
            return count;
        } catch (Exception e) {
            System.err.println("Error counting content within one week for user " + userId + ": " + e.getMessage());
            throw e;
        }
    }

    public List<Content> getContentsByCreatedDateBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return contentRepository.findAllByCreatedDateBetween(startDate, endDate);
    }


    public Content findLatestContentByGroupId(int groupId) {
        List<Content> contents = contentRepository.findLatestContentByGroupId(groupId, PageRequest.of(0, 1));
        return contents.isEmpty() ? null : contents.get(0);
    }

    public int countByGroupId(int groupId) {
        return contentRepository.countByGroupId(groupId);
    }
    public List<Object[]> findUserWithMostContentByGroupId(Integer groupId) {
        return  contentRepository.findUserWithMostContentByGroupId(groupId);
    }




}

// kym //