package com.devrats;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DevRatsApplication {
    public static void main(String[] args) {
        SpringApplication.run(DevRatsApplication.class, args);
    }
}
