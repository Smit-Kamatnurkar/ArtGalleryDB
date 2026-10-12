package com.artgallery.controller;

import com.artgallery.dto.ArtworkRequest;
import com.artgallery.dto.ArtworkResponse;
import com.artgallery.service.ArtworkService;
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
@RequestMapping("/api/artworks")
public class ArtworkController {

    private final ArtworkService artworkService;

    public ArtworkController(ArtworkService artworkService) {
        this.artworkService = artworkService;
    }

    /** SELECT with search / status / artist filters — available to all authenticated users. */
    @GetMapping
    public List<ArtworkResponse> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String artistId) {
        return artworkService.findFiltered(search, status, artistId);
    }

    @GetMapping("/{id}")
    public ArtworkResponse getById(@PathVariable long id) {
        return artworkService.findById(id);
    }

    /** INSERT — ADMIN only. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ArtworkResponse create(@Valid @RequestBody ArtworkRequest request) {
        return artworkService.create(request);
    }

    /** UPDATE — ADMIN only. */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ArtworkResponse update(@PathVariable long id,
                                  @Valid @RequestBody ArtworkRequest request) {
        return artworkService.update(id, request);
    }

    /** DELETE — ADMIN only. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable long id) {
        artworkService.delete(id);
    }
}
