package com.ojt12.cybersquad.repository;

import com.ojt12.cybersquad.model.Content;
import com.ojt12.cybersquad.model.Resource;
import com.ojt12.cybersquad.model.SaveContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SaveContentRepository extends JpaRepository<SaveContent,Integer> {


//    @Query("SELECT id FROM Content c where c.user.id  = :userId ")
//    List<Integer> getContentIdsByUserId(@Param("userId") int userId);
//
//
//        @Query("SELECT c FROM Content c WHERE c.id IN :contentIds")
//        List<Content> getContentByContentIds(@Param("contentIds") List<Integer> contentIds);

//    @Query("SELECT s.contentId FROM SaveContent s WHERE s.userId = :userId AND c.status = true")
//    List<Integer> getContentIdsByUserId(@Param("userId") int userId);
//    @Query("SELECT s.contentId FROM SaveContent s JOIN Content c ON s.contentId = c.id WHERE s.userId = :userId AND c.status = true")
//    List<Integer> getContentIdsByUserId(@Param("userId") int userId);
    @Query("SELECT s.contentId FROM SaveContent s WHERE s.userId = :userId AND s.status = true")
    List<Integer> getContentIdsByUserId(@Param("userId") int userId);


    @Query("SELECT c FROM Content c WHERE c.id IN :contentIds  ")
    List<Content> getContentByContentIds(@Param("contentIds") List<Integer> contentIds);

//    @Query("SELECT s FROM SaveContent s WHERE s.contentId = :id")
//    SaveContent findByContentId(@Param("id") int id);

    @Query("SELECT s.id FROM SaveContent s WHERE s.contentId = :contentId")
    int saveId(@Param("contentId") int contentId);
}
