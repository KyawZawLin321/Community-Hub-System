package com.ojt12.cybersquad.service;

import com.ojt12.cybersquad.model.Share;
import com.ojt12.cybersquad.repository.ShareRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

// kym //
@Service
public class ShareService {
    @Autowired
    private ShareRepository shareRepository;

    @Transactional()
    public int countSharesByContentId(int contentId) {
        return shareRepository.countByContentId(contentId);
    }


    /*STRM*/

    public int countSharesByUserId(int id) {
        return shareRepository.countShareByUserId(id);
    }
     public Optional<Share> findShareById(int shareId) {
        return shareRepository.findById(shareId);
    }
    public int getShareCountWithinOneWeek(int userId) {
        try {
            int count = shareRepository.countShareWithinOneWeek(userId);
            System.out.println("Share count within one week for user " + userId + ": " + count);
            return count;
        } catch (Exception e) {
            System.err.println("Error counting content within one week for user " + userId + ": " + e.getMessage());
            throw e;
        }
    }

    public Map<String, Integer> countSharesByDayOfWeek(int userId) {
        List<Object[]> results = shareRepository.countSharesByDayOfWeek(userId);
        Map<String, Integer> sharesByDay = new HashMap<>();
        for (Object[] result : results) {
            String day = (String) result[0];
            int count = ((Number) result[1]).intValue();
            sharesByDay.put(day, count);
        }
        return sharesByDay;
    }



    /*STRM*/
}
// kym //