package com.zytra.user_server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configure(http)) // Enable CORS
                .csrf(csrf -> csrf.disable()) // Disable CSRF for REST API
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // No
                                                                                                              // sessions
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // Allow all requests (your AuthInterceptor handles auth)
                );

        return http.build();
    }
}
