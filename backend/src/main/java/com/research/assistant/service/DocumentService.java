package com.research.assistant.service;

import com.research.assistant.entity.Document;
import com.research.assistant.entity.User;
import com.research.assistant.repository.DocumentRepository;
import com.research.assistant.repository.UserRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DocumentService {
    
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final Path storageLocation;

    public DocumentService(DocumentRepository documentRepository, 
                           UserRepository userRepository,
                           @Value("${app.local-storage.path}") String storagePath) throws IOException {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.storageLocation = Paths.get(storagePath).toAbsolutePath().normalize();
        Files.createDirectories(this.storageLocation);
    }

    public Document uploadDocument(Long userId, MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        if (user == null) {
            user = userRepository.findAll().stream().findFirst()
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setUsername("admin");
                        newUser.setEmail("admin@example.com");
                        newUser.setPasswordHash("hashed_pass");
                        return userRepository.save(newUser);
                    });
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            originalFilename = Paths.get(originalFilename).getFileName().toString();
        }
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "document.pdf";
        }

        String filename = System.currentTimeMillis() + "_" + originalFilename;
        Path targetLocation = this.storageLocation.resolve(filename);
        Files.createDirectories(targetLocation.getParent());

        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        String fileHash = calculateHash(targetLocation.toFile());

        Document doc = new Document();
        doc.setUser(user);
        doc.setTitle(originalFilename);
        doc.setFilePath(targetLocation.toString());
        doc.setFileHash(fileHash);
        doc.setUploadTimestamp(LocalDateTime.now());

        return documentRepository.save(doc);
    }

    public String extractTextFromPdf(String filePath) throws IOException {
        File file = new File(filePath);
        if (!file.exists()) {
            throw new IOException("File not found: " + filePath);
        }
        try (PDDocument document = Loader.loadPDF(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    public List<Document> getUserDocuments(Long userId) {
        List<Document> docs = documentRepository.findByUserId(userId);
        if (docs.isEmpty()) {
            return documentRepository.findAll();
        }
        return docs;
    }

    public void deleteDocument(Long id) {
        documentRepository.findById(id).ifPresent(doc -> {
            try {
                if (doc.getFilePath() != null) {
                    Files.deleteIfExists(Paths.get(doc.getFilePath()));
                }
            } catch (Exception ignored) {}
            documentRepository.delete(doc);
        });
    }

    public Document getDocumentById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with id: " + id));
    }

    public Resource getDocumentFile(Long id) throws IOException {
        Document doc = getDocumentById(id);
        Path path = Paths.get(doc.getFilePath());
        if (!Files.exists(path)) {
            throw new IOException("File not found on disk: " + doc.getFilePath());
        }
        return new UrlResource(path.toUri());
    }

    public String getDocumentText(Long id) throws IOException {
        Document doc = getDocumentById(id);
        return extractTextFromPdf(doc.getFilePath());
    }

    private String calculateHash(File file) throws NoSuchAlgorithmException, IOException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] bytes = Files.readAllBytes(file.toPath());
        byte[] hash = digest.digest(bytes);
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
