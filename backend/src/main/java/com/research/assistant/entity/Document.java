package com.research.assistant.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;


    @Column(nullable = false)
    private String title;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "upload_timestamp")
    private LocalDateTime uploadTimestamp;

    @Column(name = "file_hash")
    private String fileHash;

    @Column(columnDefinition = "TEXT")
    private String metadata;

    @PrePersist
    protected void onCreate() {
        uploadTimestamp = LocalDateTime.now();
    }
}
