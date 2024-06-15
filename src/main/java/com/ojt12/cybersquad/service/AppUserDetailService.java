package com.ojt12.cybersquad.service;

import com.ojt12.cybersquad.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
/*KZL*/

@Service
public class AppUserDetailService implements UserDetailsService {

    @Autowired
    private UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String staffId) throws UsernameNotFoundException {
        return userRepo.findOneByStaffId(staffId)
                .map(user-> User.withUsername(user.getStaffId())
                        .password(user.getPassword())
                        .authorities(AuthorityUtils.createAuthorityList(user.getRole().name()))
                        .disabled(!user.isStatus())
                        .accountExpired(!user.isStatus())
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException(("There is no user with login StaffId or Password ")));

    }
    /*KZL*/

}

