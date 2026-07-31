package com.fitness.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

public class AuthRequest {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Login {
        @NotBlank(message = "Username is required")
        private String username;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Register {
        @NotBlank(message = "Username is required")
        private String username;

        @NotBlank(message = "Password is required")
        private String password;

        @NotBlank(message = "Name is required")
        private String name;

        private String role; // ROLE_COACH, ROLE_ADMIN
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TokenResponse {
        private String token;
        private String tokenType;
        private Long expiresInMs;
        private String username;
        private String role;
    }
}
