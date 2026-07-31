package com.fitness.backend.controller;

import com.fitness.backend.entity.VideoRecord;
import com.fitness.backend.service.VideoProcessingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/videos")
@RequiredArgsConstructor
@Tag(name = "Video Upload & Background Processing API", description = "Endpoints for Video File Upload and Async Background Frame Processing")
public class VideoController {

    private final VideoProcessingService videoProcessingService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload Video File", description = "Upload MP4 video file for an athlete with @Async background processing queue")
    public ResponseEntity<VideoRecord> uploadVideo(
            @RequestParam("athleteId") String athleteId,
            @RequestParam(value = "clientVideoId", required = false) String clientVideoId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        VideoRecord record = videoProcessingService.handleVideoUpload(athleteId, clientVideoId, file);
        return ResponseEntity.ok(record);
    }
}
