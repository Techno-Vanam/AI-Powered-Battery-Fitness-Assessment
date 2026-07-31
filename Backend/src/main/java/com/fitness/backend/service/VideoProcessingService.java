package com.fitness.backend.service;

import com.fitness.backend.entity.VideoRecord;
import com.fitness.backend.repository.VideoRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoProcessingService {

    private final VideoRecordRepository videoRecordRepository;

    @Value("${app.upload.dir:./uploads/videos}")
    private String uploadDir;

    public VideoRecord handleVideoUpload(String athleteId, String clientVideoId, MultipartFile file) throws IOException {
        String videoId = (clientVideoId != null && !clientVideoId.trim().isEmpty())
                ? clientVideoId.trim()
                : UUID.randomUUID().toString();

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = videoId + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        file.transferTo(filePath.toFile());

        VideoRecord record = VideoRecord.builder()
                .clientVideoId(videoId)
                .athleteId(athleteId)
                .fileName(fileName)
                .filePath(filePath.toString())
                .fileSize(file.getSize())
                .status("PROCESSING")
                .build();

        VideoRecord saved = videoRecordRepository.save(record);

        // Dispatch background processing asynchronously
        processVideoInBackground(saved.getId());

        return saved;
    }

    @Async
    public CompletableFuture<Void> processVideoInBackground(String videoRecordId) {
        log.info("Starting background video processing task for record ID: {}", videoRecordId);
        try {
            // Simulate video frame extraction, pose verification, and hashing background task
            Thread.sleep(1500);

            VideoRecord record = videoRecordRepository.findById(videoRecordId).orElse(null);
            if (record != null) {
                record.setStatus("COMPLETED");
                record.setDurationSeconds(10);
                videoRecordRepository.save(record);
                log.info("Successfully completed background processing for video record ID: {}", videoRecordId);
            }
        } catch (Exception e) {
            log.error("Error processing video background task for record ID: {}", videoRecordId, e);
            VideoRecord record = videoRecordRepository.findById(videoRecordId).orElse(null);
            if (record != null) {
                record.setStatus("FAILED");
                record.setErrorMessage(e.getMessage());
                videoRecordRepository.save(record);
            }
        }
        return CompletableFuture.completedFuture(null);
    }
}
