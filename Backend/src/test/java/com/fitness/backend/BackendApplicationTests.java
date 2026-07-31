package com.fitness.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.backend.dto.AthleteDto;
import com.fitness.backend.dto.AuthRequest;
import com.fitness.backend.dto.BulkSyncRequest;
import com.fitness.backend.dto.HeightTestDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class BackendApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String jwtToken;

    @BeforeEach
    void setUp() throws Exception {
        String username = "coach_" + UUID.randomUUID().toString().substring(0, 6);
        AuthRequest.Register reg = new AuthRequest.Register(username, "password123", "Coach Smith", "ROLE_COACH");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        String responseStr = result.getResponse().getContentAsString();
        AuthRequest.TokenResponse tokenResponse = objectMapper.readValue(responseStr, AuthRequest.TokenResponse.class);
        this.jwtToken = tokenResponse.getToken();
    }

    @Test
    void testUserRegistrationAndLogin() throws Exception {
        String username = "user_" + UUID.randomUUID().toString().substring(0, 6);
        AuthRequest.Register reg = new AuthRequest.Register(username, "pass1234", "John Doe", "ROLE_COACH");

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is(username)));

        AuthRequest.Login login = new AuthRequest.Login(username, "pass1234");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void testRegisterAthleteAndDuplicatePrevention() throws Exception {
        String phone = "9876543" + (int)(Math.random() * 900 + 100);
        AthleteDto athlete = AthleteDto.builder()
                .clientAthleteId("ath-client-101")
                .name("Speedy Athlete")
                .gender("male")
                .dateOfBirth("2006-05-15")
                .phone(phone)
                .schoolAcademy("National Sports Academy")
                .build();

        MvcResult res1 = mockMvc.perform(post("/api/v1/athletes")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(athlete)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.name", is("Speedy Athlete")))
                .andReturn();

        AthleteDto created = objectMapper.readValue(res1.getResponse().getContentAsString(), AthleteDto.class);

        // Submitting duplicate with same phone or client ID should return existing record idempotently
        mockMvc.perform(post("/api/v1/athletes")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(athlete)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(created.getId())));
    }

    @Test
    void testUploadHeightResultWithIdempotencyKey() throws Exception {
        String clientMeasId = "meas-" + UUID.randomUUID();
        HeightTestDto testDto = HeightTestDto.builder()
                .clientMeasurementId(clientMeasId)
                .athleteId("ath-123")
                .heightCm(178.5)
                .heightPixels(714.0)
                .markerScale(0.25)
                .markerConfidence(90.0)
                .poseConfidence(88.0)
                .overallConfidence(89.0)
                .deviceId("device-galaxy-tab")
                .build();

        MvcResult res = mockMvc.perform(post("/api/v1/height-tests")
                .header("Authorization", "Bearer " + jwtToken)
                .header("X-Idempotency-Key", clientMeasId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.heightCm", is(178.5)))
                .andReturn();

        HeightTestDto created = objectMapper.readValue(res.getResponse().getContentAsString(), HeightTestDto.class);

        // Re-uploading with same idempotency key returns existing record
        mockMvc.perform(post("/api/v1/height-tests")
                .header("Authorization", "Bearer " + jwtToken)
                .header("X-Idempotency-Key", clientMeasId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(created.getId())));
    }

    @Test
    void testBulkOfflineSync() throws Exception {
        AthleteDto ath = AthleteDto.builder()
                .clientAthleteId("sync-ath-1")
                .name("Offline Athlete")
                .gender("female")
                .build();

        HeightTestDto height = HeightTestDto.builder()
                .clientMeasurementId("sync-height-1")
                .athleteId("sync-ath-1")
                .heightCm(165.0)
                .build();

        BulkSyncRequest request = BulkSyncRequest.builder()
                .deviceId("device-offline-1")
                .athletes(List.of(ath))
                .heightTests(List.of(height))
                .build();

        mockMvc.perform(post("/api/v1/sync/bulk")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.processedAthletes", is(1)))
                .andExpect(jsonPath("$.processedHeightTests", is(1)))
                .andExpect(jsonPath("$.status", is("SUCCESS")));
    }

    @Test
    void testMultipartVideoUpload() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test_height_assessment.mp4",
                "video/mp4",
                "dummy video content".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/videos/upload")
                .file(file)
                .param("athleteId", "ath-video-test-1")
                .param("clientVideoId", "vid-" + UUID.randomUUID())
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", in(List.of("PROCESSING", "COMPLETED"))));
    }

    @Test
    void testGetSummaryReport() throws Exception {
        mockMvc.perform(get("/api/v1/reports/summary")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAthletesRegistered").exists())
                .andExpect(jsonPath("$.totalHeightTestsConducted").exists());
    }

    @Test
    void testOpenApiDocsAvailable() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.openapi").isNotEmpty())
                .andExpect(jsonPath("$.info.title").value(containsString("Battery Fitness Assessment")));
    }
}
