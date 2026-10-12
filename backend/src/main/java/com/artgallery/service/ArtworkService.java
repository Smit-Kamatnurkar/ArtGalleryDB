package com.artgallery.service;

import com.artgallery.dto.ArtworkRequest;
import com.artgallery.dto.ArtworkResponse;
import com.artgallery.exception.ConflictException;
import com.artgallery.exception.NotFoundException;
import com.artgallery.repository.ArtistRepository;
import com.artgallery.repository.ArtworkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ArtworkService {

    private final ArtworkRepository artworkRepository;
    private final ArtistRepository artistRepository;

    public ArtworkService(ArtworkRepository artworkRepository, ArtistRepository artistRepository) {
        this.artworkRepository = artworkRepository;
        this.artistRepository = artistRepository;
    }

    public List<ArtworkResponse> findFiltered(String search, String status, String artistId) {
        return artworkRepository.findFiltered(search, status, artistId);
    }

    public ArtworkResponse findById(long id) {
        return artworkRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Artwork " + id + " not found"));
    }

    @Transactional
    public ArtworkResponse create(ArtworkRequest request) {
        if (!artistRepository.existsById(request.artistId())) {
            throw new NotFoundException("Artist " + request.artistId() + " not found (foreign key)");
        }
        if (artworkRepository.existsByCode(request.code())) {
            throw new ConflictException("Artwork code " + request.code() + " already exists (UNIQUE constraint)");
        }
        long id = artworkRepository.insert(request);
        return findById(id);
    }

    @Transactional
    public ArtworkResponse update(long id, ArtworkRequest request) {
        if (!artistRepository.existsById(request.artistId())) {
            throw new NotFoundException("Artist " + request.artistId() + " not found (foreign key)");
        }
        if (!artworkRepository.existsByCode(request.code()) && codeOwnedByOther(request.code(), id)) {
            throw new ConflictException("Artwork code " + request.code() + " already exists (UNIQUE constraint)");
        }
        artworkRepository.update(id, request);
        return findById(id);
    }

    @Transactional
    public void delete(long id) {
        if (artworkRepository.findById(id).isEmpty()) {
            throw new NotFoundException("Artwork " + id + " not found");
        }
        artworkRepository.deleteById(id);
    }

    private boolean codeOwnedByOther(String code, long id) {
        return artworkRepository.findFiltered(code, null, null).stream()
                .anyMatch(w -> w.code().equals(code) && w.id() != id);
    }
}
