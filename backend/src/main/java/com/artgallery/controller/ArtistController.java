package com.artgallery.controller;

import com.artgallery.dto.ArtistRequest;
import com.artgallery.dto.ArtistResponse;
import com.artgallery.service.ArtistService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/artists")
public class ArtistController {

    private final ArtistService artistService;

    public ArtistController(ArtistService artistService) {
        this.artistService = artistService;
    }

    /** SELECT with search filter — available to all authenticated users. */
    @GetMapping
    public List<ArtistResponse> getAll(@RequestParam(required = false) String search) {
        return artistService.findAll(search);
    }

    @GetMapping("/{id}")
    public ArtistResponse getById(@PathVariable String id) {
        return artistService.findById(id);
    }

    /** INSERT — ADMIN only. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ArtistResponse create(@Valid @RequestBody ArtistRequest request) {
        return artistService.create(request);
    }

    /** UPDATE — ADMIN only. */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ArtistResponse update(@PathVariable String id,
                                 @Valid @RequestBody ArtistRequest request) {
        return artistService.update(id, request);
    }

    /** DELETE — ADMIN only, protected by FK ON DELETE RESTRICT. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        artistService.delete(id);
    }
}
