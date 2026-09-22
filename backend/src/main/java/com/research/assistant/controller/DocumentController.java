package com.research.assistant.controller;

import com.research.assistant.entity.Document;
import com.research.assistant.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {
    
    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam(value = "userId", required = false, defaultValue = "1") Long userId, 
            @RequestParam("file") MultipartFile file) {
        try {
            Document doc = documentService.uploadDocument(userId, file);
            return ResponseEntity.ok(doc);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }

    @GetMapping({"", "/", "/user/{userId}"})
    public ResponseEntity<List<Document>> getUserDocuments(@PathVariable(value = "userId", required = false) Long userId) {
        return ResponseEntity.ok(documentService.getUserDocuments(userId != null ? userId : 1L));
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> getDocumentFile(@PathVariable Long id) {
        try {
            Document doc = documentService.getDocumentById(id);
            Resource resource = documentService.getDocumentFile(id);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getTitle() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/text")
    public ResponseEntity<?> getDocumentText(@PathVariable Long id) {
        try {
            Document doc = documentService.getDocumentById(id);
            String text = documentService.getDocumentText(id);
            return ResponseEntity.ok(Map.of(
                    "id", doc.getId(),
                    "title", doc.getTitle(),
                    "text", text
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        try {
            documentService.deleteDocument(id);
            return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
