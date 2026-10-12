package com.artgallery.repository;

import com.artgallery.dto.SaleRequest;
import com.artgallery.dto.SaleResponse;
import com.artgallery.exception.ConflictException;
import com.artgallery.exception.NotFoundException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public class SaleRepository {

    private final JdbcTemplate jdbc;

    public SaleRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final String BASE_SELECT = """
        SELECT s.id, s.artwork_id, w.title AS artwork_title, w.code AS artwork_code,
               s.buyer_name, s.buyer_email, s.sale_price, s.sale_date, s.commission_rate,
               s.status, s.created_at
        FROM sales s
        JOIN artworks w ON w.id = s.artwork_id
        """;

    public List<SaleResponse> findAll() {
        return jdbc.query(BASE_SELECT + " ORDER BY s.sale_date DESC, s.id DESC", (rs, i) -> mapRow(rs));
    }

    public Optional<SaleResponse> findById(long id) {
        try {
            return Optional.ofNullable(jdbc.queryForObject(
                    BASE_SELECT + " WHERE s.id = ?", (rs, i) -> mapRow(rs), id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public boolean existsByArtworkId(long artworkId) {
        Boolean exists = jdbc.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM sales WHERE artwork_id = ?)", Boolean.class, artworkId);
        return Boolean.TRUE.equals(exists);
    }

    @Transactional
    public SaleResponse recordSale(SaleRequest req) {
        // Verify artwork exists
        Boolean artworkExists = jdbc.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM artworks WHERE id = ?)", Boolean.class, req.artworkId());
        if (!Boolean.TRUE.equals(artworkExists)) {
            throw new NotFoundException("Artwork ID " + req.artworkId() + " not found");
        }

        // Check if artwork already has a recorded sale
        if (existsByArtworkId(req.artworkId())) {
            throw new ConflictException("Artwork ID " + req.artworkId() + " has already been sold (UNIQUE constraint on sales.artwork_id)");
        }

        LocalDate saleDate = req.saleDate() != null ? req.saleDate() : LocalDate.now();
        BigDecimal commission = req.commissionRate() != null ? req.commissionRate() : new BigDecimal("0.15");
        String status = req.status() != null ? req.status() : "Completed";

        KeyHolder keys = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO sales (artwork_id, buyer_name, buyer_email, sale_price, sale_date, commission_rate, status) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, req.artworkId());
            ps.setString(2, req.buyerName());
            ps.setString(3, req.buyerEmail());
            ps.setBigDecimal(4, req.salePrice());
            ps.setDate(5, Date.valueOf(saleDate));
            ps.setBigDecimal(6, commission);
            ps.setString(7, status);
            return ps;
        }, keys);

        Number key = keys.getKeys() == null ? null : (Number) keys.getKeys().get("id");
        long saleId = key == null ? -1 : key.longValue();

        // Update artwork status to 'Acquired'
        jdbc.update("UPDATE artworks SET status = 'Acquired' WHERE id = ?", req.artworkId());

        return findById(saleId).orElseThrow(() -> new NotFoundException("Created sale not found"));
    }

    private SaleResponse mapRow(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new SaleResponse(
                rs.getLong("id"),
                rs.getLong("artwork_id"),
                rs.getString("artwork_title"),
                rs.getString("artwork_code"),
                rs.getString("buyer_name"),
                rs.getString("buyer_email"),
                rs.getBigDecimal("sale_price"),
                rs.getDate("sale_date").toLocalDate(),
                rs.getBigDecimal("commission_rate"),
                rs.getString("status"),
                rs.getTimestamp("created_at") == null ? null : rs.getTimestamp("created_at").toLocalDateTime());
    }
}
