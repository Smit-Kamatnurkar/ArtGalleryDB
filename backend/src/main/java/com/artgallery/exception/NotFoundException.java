package com.artgallery.exception;

/** Thrown when a referenced resource does not exist (HTTP 404). */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
