package com.artgallery.service;

import com.artgallery.dto.LoginRequest;
import com.artgallery.dto.UserResponse;
import com.artgallery.exception.BadRequestException;
import com.artgallery.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /** Validates credentials against the database and creates a server session. */
    public UserResponse login(LoginRequest request) {
        UserRepository.UserRow user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!user.isActive()) {
            throw new BadRequestException("This account has been deactivated");
        }

        // Constant-time BCrypt comparison against the stored hash
        if (!passwordEncoder.matches(request.password(), user.passwordHash())) {
            throw new BadRequestException("Invalid email or password");
        }

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(new AuthenticatedUser(user));
        SecurityContextHolder.setContext(context);

        userRepository.updateLastLogin(user.id());

        return new UserResponse(user.id(), user.email(), user.name(), user.role());
    }

    public UserResponse currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof AuthenticatedUser authenticated) {
            UserRepository.UserRow user = authenticated.user();
            return new UserResponse(user.id(), user.email(), user.name(), user.role());
        }
        throw new AuthenticationCredentialsNotFoundException("No active session");
    }

    public String currentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth instanceof AuthenticatedUser authenticated
                ? authenticated.user().email() : null;
    }

    /** Minimal Authentication implementation backed by the database row. */
    public static class AuthenticatedUser implements Authentication {
        private final UserRepository.UserRow user;

        public AuthenticatedUser(UserRepository.UserRow user) {
            this.user = user;
        }

        public UserRepository.UserRow user() {
            return user;
        }

        @Override public String getName() { return user.email(); }
        @Override public Object getCredentials() { return null; }
        @Override public Object getDetails() { return null; }
        @Override public Object getPrincipal() { return user; }
        @Override public boolean isAuthenticated() { return true; }
        @Override public void setAuthenticated(boolean isAuthenticated) {}
        @Override public java.util.Collection<org.springframework.security.core.GrantedAuthority> getAuthorities() {
            return java.util.List.of(() -> "ROLE_" + user.role());
        }
    }
}
