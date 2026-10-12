package com.artgallery.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/** Centralized error handling — consistent JSON errors, no stack traces. */
@RestControllerAdvice
public class GlobalExceptionHandler {

    public record ApiErrorResponse(String status, int statusCode, String message,
                                   Map<String, String> fieldErrors, Instant timestamp) {}

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(NotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiErrorResponse> handleConflict(ConflictException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), null);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiErrorResponse> handleBadRequest(BadRequestException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }
        return build(HttpStatus.BAD_REQUEST, "Validation failed", fieldErrors);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(Exception ex) {
        return build(HttpStatus.FORBIDDEN, "You do not have permission to perform this operation", null);
    }

    @ExceptionHandler(org.springframework.security.authentication.AuthenticationCredentialsNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNoCredentials(Exception ex) {
        return build(HttpStatus.UNAUTHORIZED, "Authentication required", null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception ex) {
        // Logged server-side only; clients receive a sanitized message.
        org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler.class)
                .error("Unhandled server error", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected server error occurred", null);
    }

    private ResponseEntity<ApiErrorResponse> build(HttpStatus status, String message,
                                                   Map<String, String> fieldErrors) {
        ApiErrorResponse body = new ApiErrorResponse(
                status.getReasonPhrase(), status.value(), message, fieldErrors, Instant.now());
        return ResponseEntity.status(status).body(body);
    }
}
