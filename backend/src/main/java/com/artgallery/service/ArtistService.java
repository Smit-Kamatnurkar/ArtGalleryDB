package com.artgallery.service;

import com.artgallery.dto.ArtistRequest;
import com.artgallery.dto.ArtistResponse;
import com.artgallery.exception.ConflictException;
import com.artgallery.exception.NotFoundException;
import com.artgallery.repository.ArtistRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ArtistService {

    private final ArtistRepository artistRepository;

    public ArtistService(ArtistRepository artistRepository) {
        this.artistRepository = artistRepository;
    }

    public List<ArtistResponse> findAll(String search) {
        return artistRepository.findAll(search);
    }

    public ArtistResponse findById(String id) {
        return artistRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Artist " + id + " not found"));
    }

    @Transactional
    public ArtistResponse create(ArtistRequest request) {
        String id;
        if (request.id() == null || request.id().isBlank()) {
            id = artistRepository.nextArtistId();
        } else {
            id = request.id();
            if (artistRepository.existsById(id)) {
                throw new ConflictException("Artist id " + id + " already exists (UNIQUE constraint)");
            }
        }
        artistRepository.insert(id, request);
        return findById(id);
    }

    @Transactional
    public ArtistResponse update(String id, ArtistRequest request) {
        if (!artistRepository.existsById(id)) {
            throw new NotFoundException("Artist " + id + " not found");
        }
        artistRepository.update(id, request);
        return findById(id);
    }

    /**
     * Deletes an artist inside a transaction. The FK_ARTWORKS_ARTIST constraint
     * (ON DELETE RESTRICT) prevents deletion while artworks reference the artist;
     * the constraint violation is surfaced as HTTP 409 with a clear message.
     */
    @Transactional
    public void delete(String id) {
        if (!artistRepository.existsById(id)) {
            throw new NotFoundException("Artist " + id + " not found");
        }
        long dependent = artistRepository.countArtworksByArtist(id);
        if (dependent > 0) {
            throw new ConflictException(
                    "Integrity constraint violation: " + dependent
                    + " artwork(s) in ARTWORKS depend on " + id
                    + " (FK ON DELETE RESTRICT). Remove them first.");
        }
        try {
            artistRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException(
                    "Integrity constraint violation: artworks depend on " + id);
        }
    }
}
