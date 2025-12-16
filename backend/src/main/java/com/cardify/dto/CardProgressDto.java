package com.cardify.dto;

import com.cardify.entity.CardProgress;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardProgressDto {
    private CardProgress.ProgressStatus status;
    private Integer timesReviewed;
    private Integer timesMastered;
    private Integer timesStruggled;
}

