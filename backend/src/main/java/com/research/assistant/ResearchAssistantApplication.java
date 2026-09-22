package com.research.assistant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import com.research.assistant.entity.User;
import com.research.assistant.repository.UserRepository;
import java.time.LocalDateTime;

@SpringBootApplication
public class ResearchAssistantApplication {

    public static void main(String[] args) {
        SpringApplication.run(ResearchAssistantApplication.class, args);
    }

    @Bean
    public CommandLineRunner dataLoader(UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                User user = new User();
                user.setUsername("admin");
                user.setEmail("admin@example.com");
                user.setPasswordHash("hashed_pass");
                user.setCreatedAt(LocalDateTime.now());
                userRepository.save(user);
                System.out.println("Created default user with ID: " + user.getId());
            }
        };
    }
}
