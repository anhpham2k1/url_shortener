package com.anhpt.urlshortener.link.presentation.controller;

import com.anhpt.urlshortener.link.application.dto.request.CreateShortLinkRequest;
import com.anhpt.urlshortener.link.application.dto.request.UpdateShortLinkRequest;
import com.anhpt.urlshortener.link.application.dto.response.ShortLinkResponse;
import com.anhpt.urlshortener.link.application.usecase.*;
import com.anhpt.urlshortener.shared.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/links")
public class LinkController {

    private final CreateShortLinkUseCase createUseCase;
    private final GetMyLinksUseCase getMyLinksUseCase;
    private final GetShortLinkUseCase getShortLinkUseCase;
    private final UpdateShortLinkUseCase updateUseCase;
    private final DeleteShortLinkUseCase deleteUseCase;

    public LinkController(CreateShortLinkUseCase createUseCase,
                          GetMyLinksUseCase getMyLinksUseCase,
                          GetShortLinkUseCase getShortLinkUseCase,
                          UpdateShortLinkUseCase updateUseCase,
                          DeleteShortLinkUseCase deleteUseCase) {
        this.createUseCase = createUseCase;
        this.getMyLinksUseCase = getMyLinksUseCase;
        this.getShortLinkUseCase = getShortLinkUseCase;
        this.updateUseCase = updateUseCase;
        this.deleteUseCase = deleteUseCase;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ShortLinkResponse>> create(
            @Valid @RequestBody CreateShortLinkRequest request) {
        ShortLinkResponse response = createUseCase.execute(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Short link created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShortLinkResponse>>> getMyLinks() {
        List<ShortLinkResponse> response = getMyLinksUseCase.execute();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShortLinkResponse>> getById(@PathVariable Long id) {
        ShortLinkResponse response = getShortLinkUseCase.execute(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ShortLinkResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateShortLinkRequest request) {
        ShortLinkResponse response = updateUseCase.execute(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Short link updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        deleteUseCase.execute(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Short link deleted successfully"));
    }
}
