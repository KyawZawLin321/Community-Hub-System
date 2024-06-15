package com.ojt12.cybersquad.config;

import com.ojt12.cybersquad.model.User;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@EnableWebSecurity
@Configuration
public class SecurityConfig {
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain httpSecurity(HttpSecurity http) throws Exception {
        http.formLogin(form -> form.loginPage("/login")
                .failureUrl("/login?error=true")
                .usernameParameter("staffId")
                .loginProcessingUrl("/authenticate")
                .defaultSuccessUrl("/home", true));
        http.logout(logout -> logout.logoutUrl("/logout").logoutSuccessUrl("/"));

        http.csrf(AbstractHttpConfigurer::disable);
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login", "/home", "/auth/**", "static/assets/**", "templates/**","/forgotPassword","/sendEmail","resetPassword/**").permitAll()
                .requestMatchers("/user/**","/group/**","/guideline/**").hasAnyAuthority(User.Role.Admin.name(), User.Role.User.name())
                .requestMatchers("/admin/**").hasAuthority(User.Role.Admin.name())
                .anyRequest().authenticated())

                .exceptionHandling(exceptionHandling -> exceptionHandling
                .accessDeniedPage("/access-denied"));
        http.logout(logout->logout.logoutUrl("/logout").logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID"));
        return http.build();
    }
}