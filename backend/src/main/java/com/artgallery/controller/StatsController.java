package com.artgallery.controller;

import com.artgallery.dto.StatsResponse;
import com.artgallery.repository.StatsRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Dashboard statistics and SQL execution history — every value is computed
 * with live SQL aggregates against PostgreSQL (never hardcoded).
 */
@RestController
@RequestMapping("/api")
public class StatsController {

    private final StatsRepository statsRepository;

    public StatsController(StatsRepository statsRepository) {
        this.statsRepository = statsRepository;
    }

    @GetMapping("/stats")
    public StatsResponse stats() {
        return new StatsResponse(
                statsRepository.countArtists(),
                statsRepository.countVerifiedMasters(),
                statsRepository.countArtworks(),
                statsRepository.sumValuation(),
                statsRepository.avgValuation(),
                statsRepository.countArtworksByStatus("Archived"),
                statsRepository.countArtworksByStatus("Exhibited"),
                statsRepository.countExhibitions(),
                statsRepository.countCurators(),
                statsRepository.countSales(),
                statsRepository.salesRevenue());
    }

    @GetMapping("/query-history")
    public List<com.artgallery.dto.QueryHistoryResponse> queryHistory() {
        return statsRepository.recentQueries(10);
    }
}
