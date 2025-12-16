package com.cardify.service;

import com.cardify.dto.DashboardStatsDto;
import com.cardify.repository.CardProgressRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class DashboardService {

    private final CardProgressRepository cardProgressRepository;

    public DashboardService(CardProgressRepository cardProgressRepository) {
        this.cardProgressRepository = cardProgressRepository;
    }

    public DashboardStatsDto getDashboardStats(UUID userId) {
        Long masteredCards = cardProgressRepository.countMasteredCardsByUserId(userId);
        Long strugglingCards = cardProgressRepository.countStrugglingCardsByUserId(userId);
        Long reviewedToday = cardProgressRepository.countCardsReviewedTodayByUserId(userId);
        
        return new DashboardStatsDto(masteredCards, strugglingCards, reviewedToday);
    }
}

