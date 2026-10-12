package com.artgallery;

import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Full-stack integration tests running against the local PostgreSQL
 * (artgallery_db). Requires the database to be running (see database/README.md).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ArtGalleryApiIntegrationTest {

    @Autowired
    private TestRestTemplate rest;

    private final Map<String, String> sessionCookies = new HashMap<>();

    // ---------------------------------------------------------------- helpers

    private ResponseEntity<String> login(String email, String password) {
        Map<String, String> body = Map.of("email", email, "password", password);
        ResponseEntity<String> response = rest.postForEntity("/api/auth/login", body, String.class);
        List<String> cookies = response.getHeaders().get(HttpHeaders.SET_COOKIE);
        if (cookies != null) {
            sessionCookies.put(email, String.join("; ", cookies.stream()
                    .map(c -> c.split(";")[0]).toList()));
        }
        return response;
    }

    private HttpEntity<Object> entity(Object body, String email) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String cookie = email == null ? null : sessionCookies.get(email);
        if (cookie != null) {
            headers.set(HttpHeaders.COOKIE, cookie);
        }
        return new HttpEntity<>(body, headers);
    }

    // ------------------------------------------------------------------ tests

    @Test
    @Order(1)
    void healthEndpointReportsDatabaseUp() {
        ResponseEntity<Map> response = rest.getForEntity("/api/health", Map.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("UP", response.getBody().get("status"));
        assertTrue(String.valueOf(response.getBody().get("database")).contains("PostgreSQL"));
    }

    @Test
    @Order(2)
    void protectedEndpointRejectsAnonymousAccess() {
        ResponseEntity<String> response = rest.getForEntity("/api/artists", String.class);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    @Order(3)
    void loginRejectsInvalidCredentials() {
        ResponseEntity<String> response = rest.postForEntity(
                "/api/auth/login", Map.of("email", "admin@artgallery.edu", "password", "wrong"), String.class);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @Order(4)
    void adminCanListArtistsFromDatabase() {
        assertEquals(HttpStatus.OK, login("admin@artgallery.edu", "admin123").getStatusCode());
        ResponseEntity<Map[]> response = rest.exchange(
                "/api/artists", HttpMethod.GET, entity(null, "admin@artgallery.edu"), Map[].class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().length >= 13, "seeded artists should be returned");
        boolean hasHokusai = List.of(response.getBody()).stream()
                .anyMatch(a -> "Katsushika Hokusai".equals(a.get("name")));
        assertTrue(hasHokusai, "seeded artist present in API response");
    }

    @Test
    @Order(5)
    void artistCrudRoundTripPersistsInPostgres() {
        login("admin@artgallery.edu", "admin123");

        // INSERT
        Map<String, Object> newArtist = new HashMap<>();
        newArtist.put("name", "Integration Test Artist");
        newArtist.put("country", "France");
        newArtist.put("countryCode", "FRA");
        ResponseEntity<Map> created = rest.exchange("/api/artists", HttpMethod.POST,
                entity(newArtist, "admin@artgallery.edu"), Map.class);
        assertEquals(HttpStatus.CREATED, created.getStatusCode());
        String id = (String) created.getBody().get("id");
        assertTrue(id.startsWith("ART-"), "backend auto-generates the registry id");

        // SELECT (persisted)
        ResponseEntity<Map> fetched = rest.exchange("/api/artists/" + id, HttpMethod.GET,
                entity(null, "admin@artgallery.edu"), Map.class);
        assertEquals(HttpStatus.OK, fetched.getStatusCode());
        assertEquals("Integration Test Artist", fetched.getBody().get("name"));

        // UPDATE
        Map<String, Object> updated = new HashMap<>(newArtist);
        updated.put("name", "Integration Test Artist Updated");
        ResponseEntity<Map> put = rest.exchange("/api/artists/" + id, HttpMethod.PUT,
                entity(updated, "admin@artgallery.edu"), Map.class);
        assertEquals(HttpStatus.OK, put.getStatusCode());
        assertEquals("Integration Test Artist Updated", put.getBody().get("name"));

        // DELETE
        ResponseEntity<Void> deleted = rest.exchange("/api/artists/" + id, HttpMethod.DELETE,
                entity(null, "admin@artgallery.edu"), Void.class);
        assertEquals(HttpStatus.OK, deleted.getStatusCode());
        assertEquals(HttpStatus.NOT_FOUND, rest.exchange("/api/artists/" + id, HttpMethod.GET,
                entity(null, "admin@artgallery.edu"), Map.class).getStatusCode());
    }

    @Test
    @Order(6)
    void deleteArtistWithArtworksIsRestrictedByForeignKey() {
        login("admin@artgallery.edu", "admin123");
        ResponseEntity<String> response = rest.exchange("/api/artists/ART-0081", HttpMethod.DELETE,
                entity(null, "admin@artgallery.edu"), String.class);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    @Test
    @Order(7)
    void artistValidationRejectsBlankName() {
        login("admin@artgallery.edu", "admin123");
        Map<String, Object> invalid = Map.of("name", "   ");
        ResponseEntity<Map> response = rest.exchange("/api/artists", HttpMethod.POST,
                entity(invalid, "admin@artgallery.edu"), Map.class);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @Order(8)
    void studentRoleCanReadButNotWrite() {
        assertEquals(HttpStatus.OK, login("student@artgallery.edu", "student123").getStatusCode());
        assertEquals(HttpStatus.OK, rest.exchange("/api/artworks", HttpMethod.GET,
                entity(null, "student@artgallery.edu"), Map[].class).getStatusCode());
        ResponseEntity<String> forbidden = rest.exchange("/api/artists", HttpMethod.POST,
                entity(Map.of("name", "Hacker"), "student@artgallery.edu"), String.class);
        assertEquals(HttpStatus.FORBIDDEN, forbidden.getStatusCode());
        // SQL console is ADMIN-only
        assertEquals(HttpStatus.FORBIDDEN, rest.exchange("/api/sql/execute", HttpMethod.POST,
                entity(Map.of("sql", "SELECT 1"), "student@artgallery.edu"), String.class).getStatusCode());
    }

    @Test
    @Order(9)
    void sqlConsoleExecutesSelectAndRejectsMutations() {
        login("admin@artgallery.edu", "admin123");

        ResponseEntity<Map> ok = rest.exchange("/api/sql/execute", HttpMethod.POST,
                entity(Map.of("sql", "SELECT title, price FROM artworks WHERE price > 500000 ORDER BY price DESC"),
                        "admin@artgallery.edu"), Map.class);
        assertEquals(HttpStatus.OK, ok.getStatusCode());
        assertTrue((int) ok.getBody().get("rowCount") > 0);

        assertEquals(HttpStatus.BAD_REQUEST, rest.exchange("/api/sql/execute", HttpMethod.POST,
                entity(Map.of("sql", "DELETE FROM artworks"), "admin@artgallery.edu"), String.class).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, rest.exchange("/api/sql/execute", HttpMethod.POST,
                entity(Map.of("sql", "SELECT 1; DROP TABLE artworks"), "admin@artgallery.edu"), String.class).getStatusCode());
    }

    @Test
    @Order(10)
    void statsEndpointReturnsLiveAggregates() {
        login("admin@artgallery.edu", "admin123");
        ResponseEntity<Map> response = rest.exchange("/api/stats", HttpMethod.GET,
                entity(null, "admin@artgallery.edu"), Map.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((int) response.getBody().get("totalArtists") >= 13);
        assertTrue((int) response.getBody().get("totalArtworks") >= 16);
        assertNotNull(response.getBody().get("averageValuation"));
    }

    @Test
    @Order(11)
    void queryHistoryIsRecorded() {
        login("admin@artgallery.edu", "admin123");
        ResponseEntity<Map[]> response = rest.exchange("/api/query-history", HttpMethod.GET,
                entity(null, "admin@artgallery.edu"), Map[].class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().length >= 3);
    }

    @Test
    @Order(12)
    void schemaExplorerReturnsLiveMetadata() {
        login("admin@artgallery.edu", "admin123");
        ResponseEntity<Map[]> response = rest.exchange("/api/schema", HttpMethod.GET,
                entity(null, "admin@artgallery.edu"), Map[].class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<String> names = List.of(response.getBody()).stream()
                .map(t -> (String) t.get("name")).toList();
        assertTrue(names.contains("ARTISTS") && names.contains("ARTWORKS") && names.contains("USERS"));
    }

    @Test
    @Order(13)
    void logoutInvalidatesSession() {
        login("student@artgallery.edu", "student123");
        assertEquals(HttpStatus.OK, rest.exchange("/api/auth/logout", HttpMethod.POST,
                entity(null, "student@artgallery.edu"), String.class).getStatusCode());
        // Cookie is now invalid server-side
        ResponseEntity<String> after = rest.exchange("/api/auth/me", HttpMethod.GET,
                entity(null, "student@artgallery.edu"), String.class);
        assertTrue(after.getStatusCode() == HttpStatus.UNAUTHORIZED
                || after.getStatusCode() == HttpStatus.FORBIDDEN);
    }

    @Test
    @Order(14)
    void artworkCrudRoundTripPersistsInPostgres() {
        login("admin@artgallery.edu", "admin123");

        Map<String, Object> artwork = new HashMap<>();
        artwork.put("code", "ART-TEST-999");
        artwork.put("title", "Integration Test Artwork");
        artwork.put("artistId", "ART-0081");
        artwork.put("price", 12345.67);
        artwork.put("yearCreated", 2024);
        artwork.put("status", "Vaulted");

        ResponseEntity<Map> created = rest.exchange("/api/artworks", HttpMethod.POST,
                entity(artwork, "admin@artgallery.edu"), Map.class);
        assertEquals(HttpStatus.CREATED, created.getStatusCode());
        long id = ((Number) created.getBody().get("id")).longValue();

        assertEquals(HttpStatus.OK, rest.exchange("/api/artworks/" + id, HttpMethod.GET,
                entity(null, "admin@artgallery.edu"), Map.class).getStatusCode());

        assertEquals(HttpStatus.OK, rest.exchange("/api/artworks/" + id, HttpMethod.DELETE,
                entity(null, "admin@artgallery.edu"), Void.class).getStatusCode());

        assertFalse(created.getBody().get("code").toString().isEmpty());
    }
}
