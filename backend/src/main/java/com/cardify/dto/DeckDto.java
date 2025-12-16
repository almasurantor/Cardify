package com.cardify.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeckDto {
    private UUID id;
    private String title;
    private String subject;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long totalCards;
    private Long masteredCards;
    private Double masteredPercent;
    private List<CardDto> cards;
}

