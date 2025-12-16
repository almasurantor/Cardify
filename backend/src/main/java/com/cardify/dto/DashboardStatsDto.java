package com.cardify.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardStatsDto {
    private Long masteredCards;
    private Long strugglingCards;
    private Long reviewedToday;
}

