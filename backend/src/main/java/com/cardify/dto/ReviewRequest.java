package com.cardify.dto;

import com.cardify.entity.CardProgress;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotNull(message = "Action is required")
    private CardProgress.ProgressStatus action;
}

