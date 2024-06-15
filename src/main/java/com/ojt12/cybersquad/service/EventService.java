package com.ojt12.cybersquad.service;

import com.ojt12.cybersquad.dto.EventDto;
import com.ojt12.cybersquad.model.Event;
import com.ojt12.cybersquad.repository.EventRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import javassist.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/*STRM*/
@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;


    public Event createPost(Event event) {
        return eventRepository.save(event);
    }

    public List<Event> getEventsByStatus(boolean status) {
        return eventRepository.findByStatus(status);
    }

    public void softDeleteEventById(int id) throws NotFoundException {
        Optional<Event> optionalEvent = eventRepository.findById(id);
        if (optionalEvent.isPresent()) {
            Event event = optionalEvent.get();
            event.setStatus(false); // Set status to 0 (soft delete)
            eventRepository.save(event);
        } else {
            throw new NotFoundException("Event not found with id: " + id);
        }
    }

    public List<EventDto> searchEvent(String keyword) {
        List<Event> matchingEvents = eventRepository.findAll((Specification<Event>) (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            Expression<String> nameWithoutSpaces = criteriaBuilder.function("REPLACE", String.class,
                    criteriaBuilder.lower(root.get("content")),
                    criteriaBuilder.literal(" "),
                    criteriaBuilder.literal(""));

            // Prepare the keyword for matching
            String keywordWithoutSpaces = keyword.toLowerCase().replaceAll(" ", "");

            // Create the LIKE predicate
            predicates.add(criteriaBuilder.like(nameWithoutSpaces, "%" + keywordWithoutSpaces + "%"));
            // Add more conditions if needed for other attributes
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        });
        matchingEvents = matchingEvents.stream()
                .filter(event -> event.getStatus()==true)
                .collect(Collectors.toList());
        List<EventDto> eventDtos = matchingEvents.stream()
                .map(event -> new EventDto(
                        event.getId(),
                        event.getContent(),
                        event.getEventDetails(),
                        event.getStartDate(),
                        event.getEndDate(),
                        event.getPhotoFile(),
                        event.getUser().getId()
                ))
                .collect(Collectors.toList());
        return eventDtos;
    }
    public Event findEventById(int id){
        return  eventRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Event not found"));
    }

}






/* STRM */



























 /* @Scheduled(fixedRate = 86400000) // Runs every 24 hours
    public void deleteEventsWithEndDateGreaterThanCurrentDate() {
        LocalDateTime currentDate = LocalDateTime.now();
        List<EventDto> events = eventRepository.findByEndDateAfter(currentDate);
        for (EventDto event : events) {
            eventRepository.deleteById(event.getId());
        }
    }


    public List<Event> findEventsWithEndDateAfterCurrentDate() {
        LocalDateTime currentDate = LocalDateTime.now();
        return eventRepository.findByEndDateAfter(currentDate);
    }*/
