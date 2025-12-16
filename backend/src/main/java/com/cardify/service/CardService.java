package com.cardify.service;

import com.cardify.dto.CardDto;
import com.cardify.dto.CardProgressDto;
import com.cardify.dto.ReviewRequest;
import com.cardify.entity.Card;
import com.cardify.entity.CardProgress;
import com.cardify.entity.Deck;
import com.cardify.repository.CardProgressRepository;
import com.cardify.repository.CardRepository;
import com.cardify.repository.DeckRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CardService {

    private final CardRepository cardRepository;
    private final CardProgressRepository cardProgressRepository;
    private final DeckRepository deckRepository;

    public CardService(CardRepository cardRepository, CardProgressRepository cardProgressRepository, DeckRepository deckRepository) {
        this.cardRepository = cardRepository;
        this.cardProgressRepository = cardProgressRepository;
        this.deckRepository = deckRepository;
    }

    public List<CardDto> getStudyCards(UUID deckId, UUID userId) {
        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new RuntimeException("Deck not found"));

        if (!deck.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        List<Card> cards = cardRepository.findByDeckId(deckId);
        return cards.stream().map(card -> {
            CardProgressDto progressDto = cardProgressRepository.findByUserIdAndCardId(userId, card.getId())
                    .map(cp -> new CardProgressDto(cp.getStatus(), cp.getTimesReviewed(), cp.getTimesMastered(), cp.getTimesStruggled()))
                    .orElse(new CardProgressDto(CardProgress.ProgressStatus.NEW, 0, 0, 0));

            return new CardDto(card.getId(), card.getFrontText(), card.getBackText(), card.getImageUrl(), progressDto);
        }).collect(Collectors.toList());
    }

    @Transactional
    public CardProgressDto reviewCard(UUID cardId, UUID userId, ReviewRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));

        // Verify user owns the deck
        Deck deck = deckRepository.findById(card.getDeckId())
                .orElseThrow(() -> new RuntimeException("Deck not found"));

        if (!deck.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        CardProgress progress = cardProgressRepository.findByUserIdAndCardId(userId, cardId)
                .orElseGet(() -> {
                    CardProgress newProgress = new CardProgress();
                    newProgress.setUserId(userId);
                    newProgress.setCardId(cardId);
                    newProgress.setStatus(CardProgress.ProgressStatus.NEW);
                    return newProgress;
                });

        progress.setTimesReviewed(progress.getTimesReviewed() + 1);
        progress.setLastReviewedAt(LocalDateTime.now());

        if (request.getAction() == CardProgress.ProgressStatus.MASTERED) {
            progress.setTimesMastered(progress.getTimesMastered() + 1);
            progress.setStatus(CardProgress.ProgressStatus.MASTERED);
        } else if (request.getAction() == CardProgress.ProgressStatus.STRUGGLING) {
            progress.setTimesStruggled(progress.getTimesStruggled() + 1);
            progress.setStatus(CardProgress.ProgressStatus.STRUGGLING);
        } else if (request.getAction() == CardProgress.ProgressStatus.LEARNING) {
            progress.setStatus(CardProgress.ProgressStatus.LEARNING);
        }

        progress = cardProgressRepository.save(progress);

        return new CardProgressDto(progress.getStatus(), progress.getTimesReviewed(), 
                progress.getTimesMastered(), progress.getTimesStruggled());
    }

    public List<CardDto> getQuickReviewCards(UUID userId, int limit) {
        List<CardProgress> progressList = cardProgressRepository.findNonMasteredCardsForUser(userId);
        
        return progressList.stream()
                .limit(limit)
                .map(cp -> {
                    Card card = cardRepository.findById(cp.getCardId())
                            .orElseThrow(() -> new RuntimeException("Card not found"));
                    CardProgressDto progressDto = new CardProgressDto(cp.getStatus(), cp.getTimesReviewed(), 
                            cp.getTimesMastered(), cp.getTimesStruggled());
                    return new CardDto(card.getId(), card.getFrontText(), card.getBackText(), 
                            card.getImageUrl(), progressDto);
                })
                .collect(Collectors.toList());
    }
}

