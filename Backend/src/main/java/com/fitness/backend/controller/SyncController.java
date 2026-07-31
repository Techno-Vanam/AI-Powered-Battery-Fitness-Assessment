package com.fitness.backend.controller;

import com.fitness.backend.dto.BulkSyncRequest;
import com.fitness.backend.dto.BulkSyncResponse;
import com.fitness.backend.service.SyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sync")
@RequiredArgsConstructor
@Tag(name = "Offline Sync API", description = "Endpoints for Bulk Offline Data Synchronization with Duplicate Skipping")
public class SyncController {

    private final SyncService syncService;

    @PostMapping("/bulk")
    @Operation(summary = "Bulk Offline Sync Upload", description = "Synchronize batched offline athletes and height measurements with idempotent duplicate skipping")
    public ResponseEntity<BulkSyncResponse> bulkSync(@RequestBody BulkSyncRequest request) {
        return ResponseEntity.ok(syncService.processBulkSync(request));
    }
}
