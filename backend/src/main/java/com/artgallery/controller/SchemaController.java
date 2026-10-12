package com.artgallery.controller;

import com.artgallery.dto.SchemaTableResponse;
import com.artgallery.repository.SchemaRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Live schema metadata for the Database Explorer screen. */
@RestController
@RequestMapping("/api/schema")
public class SchemaController {

    private final SchemaRepository schemaRepository;

    public SchemaController(SchemaRepository schemaRepository) {
        this.schemaRepository = schemaRepository;
    }

    @GetMapping
    public List<SchemaTableResponse> schema() {
        return schemaRepository.getSchema();
    }
}
