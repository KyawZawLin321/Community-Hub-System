package com.ojt12.cybersquad.repository;

import com.ojt12.cybersquad.model.Groups;
import com.ojt12.cybersquad.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
//Char Char :3
@Repository
public interface GroupRepository extends JpaRepository<Groups,Integer>, JpaSpecificationExecutor<Groups> {
    Groups findByName(String name);

    List<Groups> findByname(String name);

    Groups findGroupsById(int groupId);

    List<Groups> findByStatus(boolean b);

    List<Groups> findAllByStatus(boolean b);
    List<Groups> findByStatusTrue();
    @Query("SELECT u FROM User u JOIN u.groups g WHERE g.id = :groupId")
    List<User> findUsersInGroup(@Param("groupId") Integer groupId);


    @Query("SELECT g " +
            "FROM Groups g " +
            "JOIN g.users u " +
            "WHERE u.id = :userId AND g.status = true")
    List<Groups> groupShow(int userId);


//Char Char :3

}


