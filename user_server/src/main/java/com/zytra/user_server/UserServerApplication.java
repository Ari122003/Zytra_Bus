package com.zytra.user_server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class UserServerApplication {

    public static void main(String[] args) {

        SpringApplication.run(UserServerApplication.class, args);
        System.out.println("User Server is running...");
    }

}
