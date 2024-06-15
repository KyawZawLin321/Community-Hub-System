package com.ojt12.cybersquad.repository;

import com.ojt12.cybersquad.model.GroupMessage;
import com.ojt12.cybersquad.model.Groups;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupMessageRepository extends JpaRepository<GroupMessage,Integer> {

    List<GroupMessage> findMessageByGroups(Groups groups);
}
