package com.artgallery.exception;

/** Thrown when a request is semantically invalid (HTTP 400). */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
