package com.cardify.repository;

import com.cardify.entity.CardProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CardProgressRepository extends JpaRepository<CardProgress, UUID> {
    Optional<CardProgress> findByUserIdAndCardId(UUID userId, UUID cardId);
    List<CardProgress> findByUserIdAndStatus(UUID userId, CardProgress.ProgressStatus status);
    
    @Query("SELECT cp FROM CardProgress cp WHERE cp.userId = :userId AND cp.status != 'MASTERED' ORDER BY cp.status DESC, cp.lastReviewedAt ASC")
    List<CardProgress> findNonMasteredCardsForUser(UUID userId);
    
    @Query("SELECT COUNT(cp) FROM CardProgress cp WHERE cp.userId = :userId AND cp.status = 'MASTERED'")
    Long countMasteredCardsByUserId(UUID userId);
    
    @Query("SELECT COUNT(cp) FROM CardProgress cp WHERE cp.userId = :userId AND cp.status = 'STRUGGLING'")
    Long countStrugglingCardsByUserId(UUID userId);
    
    @Query("SELECT COUNT(cp) FROM CardProgress cp WHERE cp.userId = :userId AND DATE(cp.lastReviewedAt) = CURRENT_DATE")
    Long countCardsReviewedTodayByUserId(UUID userId);
}

