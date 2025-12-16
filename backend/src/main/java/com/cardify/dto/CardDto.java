package com.cardify.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardDto {
    private UUID id;
    private String frontText;
    private String backText;
    private String imageUrl;
    private CardProgressDto progress;
}

