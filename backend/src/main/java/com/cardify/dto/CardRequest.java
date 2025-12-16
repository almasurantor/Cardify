package com.cardify.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CardRequest {
    @NotBlank(message = "Front text is required")
    private String frontText;
    
    @NotBlank(message = "Back text is required")
    private String backText;
    
    private String imageUrl;
}

