package com.ojt12.cybersquad.repository;

import com.ojt12.cybersquad.model.Groups;
import com.ojt12.cybersquad.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
/*KZL*/

@Repository
public interface UserRepository extends JpaRepository<User,Integer>, JpaSpecificationExecutor<User> {
    User findByStaffId(String staffId);

    Optional<User> findOneByStaffId(String staffId);

    List<User> findByStatus(boolean b);

    User findByEmail(String email);

    List<User> findAllByStatus(boolean b);


    /*KZL*/

 //Char Char :3
    List<User> findByGroupsId(Integer groupId);

    User getUserById(Integer id);

    @Query("SELECT u FROM User u WHERE u NOT IN (SELECT u FROM User u JOIN u.groups g WHERE g = :group)")
    List<User> findUsersNotInGroup(@Param("group") Groups group);

    List<User> findByNameContainingIgnoreCase(String q);

    @Query("SELECT u FROM User u WHERE REPLACE(u.name, ' ', '') = :username")
    Optional<User> findByNameWithoutSpaces(@Param("username") String username);
    @Query("SELECT v.user FROM Vote v WHERE v.optionList.id = :optionId")
    List<User> findUsersByOptionId(@Param("optionId") int optionId);

//Char Char :3




}
