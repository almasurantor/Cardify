package com.cardify.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreateDeckRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    private String subject;
    
    @NotNull(message = "Cards are required")
    @Size(min = 1, message = "At least one card is required")
    @Valid
    private List<CardRequest> cards;
}

