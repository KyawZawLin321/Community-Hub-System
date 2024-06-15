package com.ojt12.cybersquad.repository;

import com.ojt12.cybersquad.model.Event;
import com.ojt12.cybersquad.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event,Integer>, JpaSpecificationExecutor<Event> {

    List<Event> findByEndDateAfter(LocalDateTime endDate);

    Optional<Event> findEventById(int id);

    List<Event> findByStatus(boolean status);



    /*search for all data*/
    List<Event> findByContentContainingIgnoreCase(String content);

    /*testing*/
    List<Event> findByContentContainingIgnoreCaseAndStatus(String content, boolean status);









}
