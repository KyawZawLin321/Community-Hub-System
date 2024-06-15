package com.ojt12.cybersquad.repository;

import com.ojt12.cybersquad.model.Content;
import com.ojt12.cybersquad.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource,Integer> {
    List<Resource> findAllByContent(Content content);

}
