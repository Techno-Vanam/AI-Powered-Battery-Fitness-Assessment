package com.fitness.backend.service;

import com.fitness.backend.dto.AuthRequest;
import com.fitness.backend.entity.User;
import com.fitness.backend.repository.UserRepository;
import com.fitness.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthRequest.TokenResponse register(AuthRequest.Register request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role(request.getRole() != null ? request.getRole() : "ROLE_COACH")
                .build();

        userRepository.save(user);

        String jwt = jwtService.generateToken(user);
        return AuthRequest.TokenResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .expiresInMs(jwtService.getExpirationMs())
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    public AuthRequest.TokenResponse login(AuthRequest.Login request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        String jwt = jwtService.generateToken(user);
        return AuthRequest.TokenResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .expiresInMs(jwtService.getExpirationMs())
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }
}
