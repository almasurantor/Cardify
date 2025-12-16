package com.cardify.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "card_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"userId", "cardId"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private UUID cardId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProgressStatus status = ProgressStatus.NEW;

    @Column(nullable = false)
    private Integer timesReviewed = 0;

    @Column(nullable = false)
    private Integer timesMastered = 0;

    @Column(nullable = false)
    private Integer timesStruggled = 0;

    private LocalDateTime lastReviewedAt;

    public enum ProgressStatus {
        NEW, LEARNING, MASTERED, STRUGGLING
    }
}

