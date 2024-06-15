
package com.ojt12.cybersquad.controller;


import com.ojt12.cybersquad.model.Content;
import com.ojt12.cybersquad.repository.ContentRepository;
import com.ojt12.cybersquad.repository.EventRepository;
import com.ojt12.cybersquad.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/*STRM*/

@RestController
@RequestMapping("/user")
public class AnalysisController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ContentRepository contentRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ContentService contentService;

   @Autowired
   private RemarkService remarkService;

   @Autowired
   private CommentService commentService;

   @Autowired
   private ShareService shareService;




   /* @GetMapping("/analysis")
    public ResponseEntity<Map<String, Integer>> getDashboardData() {
            try {
                Map<String, Integer> data = new HashMap<>();

                // Get counts from the database
                long eventCount = eventRepository.count();
                long contentCount = contentRepository.count();


                // Add counts to the map
                data.put("events", (int) eventCount);
                data.put("contents", (int) contentCount);

                return ResponseEntity.ok(data);
            } catch (Exception e) {

                System.out.println(e.getMessage());

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        }


*/



    @GetMapping("/analysis")
    public ResponseEntity<Map<String, Integer>> getDashboardData() {
        try {
            List<Content> allContents = contentService.findAll(); // Get all contents from all users
            Content trendingContent = null;
            int maxTotalEngagement = 0;

            for (Content content : allContents) {
                int contentId = content.getId();
                int totalLikes = remarkService.countLikesByContentId(contentId);
                int totalComments = commentService.countCommentsByContentId(contentId);
                int totalShares = shareService.countSharesByContentId(contentId);
                int totalEngagement = totalLikes + totalComments + totalShares;

                if (totalEngagement > maxTotalEngagement) {
                    maxTotalEngagement = totalEngagement;
                    trendingContent = content;
                }
            }

            Map<String, Integer> data = new HashMap<>();
            if (trendingContent != null) {
                data.put("mostPopularContent", trendingContent.getId());
            }

            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @GetMapping("/trend-post")
    public ResponseEntity<Map<String, Object>> getTrendingPost(@RequestParam String interval) {
        try {
            Map<String, Object> data = new HashMap<>();
            LocalDateTime now = LocalDateTime.now();

            LocalDateTime startDate;
            LocalDateTime endDate = now;  // By default, the end date is now

            switch (interval) {
                case "week":
                    int dayOfMonth = now.getDayOfMonth();
                    int startDay = (dayOfMonth - 1) / 7 * 7 + 1;
                    startDate = now.withDayOfMonth(startDay);
                    endDate = startDate.plusDays(6).isAfter(now) ? now : startDate.plusDays(6);
                    System.out.println(startDate);
                    System.out.println(endDate);
//                    startDate = now.with(DayOfWeek.MONDAY);
//                    endDate = now.with(DayOfWeek.SUNDAY); // End of the week (Sunday)
//                    // If the end of the week is in the future, set it to now
//                    if (endDate.isAfter(now)) {
//                        endDate = now;
//                    }
                    break;
                case "month":
                    startDate = now.withDayOfMonth(1); // Start of the current month
                    System.out.println(startDate);
                    break;
                case "year":
                    startDate = now.withDayOfYear(1); // Start of the current year
                    endDate = now.withDayOfYear(now.toLocalDate().lengthOfYear()); // End of the current year
                    break;
                default:
                    startDate = LocalDateTime.MIN; // Default case to include all dates
                    endDate = LocalDateTime.MAX;
            }

            List<Content> contents = contentService.getContentsByCreatedDateBetween(startDate, endDate);
            Content mostPopularContent = null;
            int maxTotalCount = 0;

            for (Content content : contents) {
                int contentId = content.getId();
                int totalCount = shareService.countSharesByContentId(contentId) +
                        commentService.countCommentsByContentId(contentId) +
                        remarkService.countLikesByContentId(contentId);
                if (totalCount > maxTotalCount) {
                    maxTotalCount = totalCount;
                    mostPopularContent = content;
                }
            }

            if (mostPopularContent != null) {
                data.put("mostPopularContent", mostPopularContent.getId());
            } else {
                data.put("mostPopularContent", "No trending posts found.");
            }

            return ResponseEntity.ok(data);
        } catch (Exception e) {
            // Log the exception or handle it as needed
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


}