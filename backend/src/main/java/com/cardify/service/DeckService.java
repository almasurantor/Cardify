package com.cardify.service;

import com.cardify.dto.*;
import com.cardify.entity.Card;
import com.cardify.entity.CardProgress;
import com.cardify.entity.Deck;
import com.cardify.repository.CardProgressRepository;
import com.cardify.repository.CardRepository;
import com.cardify.repository.DeckRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DeckService {

    private final DeckRepository deckRepository;
    private final CardRepository cardRepository;
    private final CardProgressRepository cardProgressRepository;

    public DeckService(DeckRepository deckRepository, CardRepository cardRepository, CardProgressRepository cardProgressRepository) {
        this.deckRepository = deckRepository;
        this.cardRepository = cardRepository;
        this.cardProgressRepository = cardProgressRepository;
    }

    public List<DeckDto> getUserDecks(UUID userId) {
        List<Deck> decks = deckRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        return decks.stream().map(deck -> {
            List<Card> cards = cardRepository.findByDeckId(deck.getId());
            long totalCards = cards.size();
            long masteredCards = cardProgressRepository.countMasteredCardsByUserId(userId);
            // Calculate mastered for this specific deck
            long deckMastered = cards.stream()
                    .mapToLong(card -> {
                        return cardProgressRepository.findByUserIdAndCardId(userId, card.getId())
                                .map(cp -> cp.getStatus() == CardProgress.ProgressStatus.MASTERED ? 1L : 0L)
                                .orElse(0L);
                    })
                    .sum();
            
            double masteredPercent = totalCards > 0 ? (double) deckMastered / totalCards * 100 : 0.0;
            
            DeckDto dto = new DeckDto();
            dto.setId(deck.getId());
            dto.setTitle(deck.getTitle());
            dto.setSubject(deck.getSubject());
            dto.setCreatedAt(deck.getCreatedAt());
            dto.setUpdatedAt(deck.getUpdatedAt());
            dto.setTotalCards(totalCards);
            dto.setMasteredCards(deckMastered);
            dto.setMasteredPercent(masteredPercent);
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public DeckDto createDeck(UUID userId, CreateDeckRequest request) {
        Deck deck = new Deck();
        deck.setUserId(userId);
        deck.setTitle(request.getTitle());
        deck.setSubject(request.getSubject());
        deck = deckRepository.save(deck);

        List<Card> cards = request.getCards().stream().map(cardReq -> {
            Card card = new Card();
            card.setDeckId(deck.getId());
            card.setFrontText(cardReq.getFrontText());
            card.setBackText(cardReq.getBackText());
            card.setImageUrl(cardReq.getImageUrl());
            return card;
        }).collect(Collectors.toList());

        cards = cardRepository.saveAll(cards);

        // Initialize progress for all cards
        cards.forEach(card -> {
            CardProgress progress = new CardProgress();
            progress.setUserId(userId);
            progress.setCardId(card.getId());
            progress.setStatus(CardProgress.ProgressStatus.NEW);
            cardProgressRepository.save(progress);
        });

        DeckDto dto = new DeckDto();
        dto.setId(deck.getId());
        dto.setTitle(deck.getTitle());
        dto.setSubject(deck.getSubject());
        dto.setCreatedAt(deck.getCreatedAt());
        dto.setUpdatedAt(deck.getUpdatedAt());
        dto.setTotalCards((long) cards.size());
        dto.setMasteredCards(0L);
        dto.setMasteredPercent(0.0);
        return dto;
    }

    public DeckDto getDeck(UUID deckId, UUID userId) {
        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new RuntimeException("Deck not found"));

        if (!deck.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        List<Card> cards = cardRepository.findByDeckId(deckId);
        List<CardDto> cardDtos = cards.stream().map(card -> {
            CardProgressDto progressDto = cardProgressRepository.findByUserIdAndCardId(userId, card.getId())
                    .map(cp -> new CardProgressDto(cp.getStatus(), cp.getTimesReviewed(), cp.getTimesMastered(), cp.getTimesStruggled()))
                    .orElse(new CardProgressDto(CardProgress.ProgressStatus.NEW, 0, 0, 0));

            return new CardDto(card.getId(), card.getFrontText(), card.getBackText(), card.getImageUrl(), progressDto);
        }).collect(Collectors.toList());

        long totalCards = cards.size();
        long masteredCards = cards.stream()
                .mapToLong(card -> {
                    return cardProgressRepository.findByUserIdAndCardId(userId, card.getId())
                            .map(cp -> cp.getStatus() == CardProgress.ProgressStatus.MASTERED ? 1L : 0L)
                            .orElse(0L);
                })
                .sum();
        double masteredPercent = totalCards > 0 ? (double) masteredCards / totalCards * 100 : 0.0;

        DeckDto dto = new DeckDto();
        dto.setId(deck.getId());
        dto.setTitle(deck.getTitle());
        dto.setSubject(deck.getSubject());
        dto.setCreatedAt(deck.getCreatedAt());
        dto.setUpdatedAt(deck.getUpdatedAt());
        dto.setTotalCards(totalCards);
        dto.setMasteredCards(masteredCards);
        dto.setMasteredPercent(masteredPercent);
        dto.setCards(cardDtos);
        return dto;
    }

    @Transactional
    public void deleteDeck(UUID deckId, UUID userId) {
        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new RuntimeException("Deck not found"));

        if (!deck.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        // Delete progress records
        List<Card> cards = cardRepository.findByDeckId(deckId);
        cards.forEach(card -> {
            cardProgressRepository.findByUserIdAndCardId(userId, card.getId())
                    .ifPresent(cardProgressRepository::delete);
        });

        // Delete cards
        cardRepository.deleteByDeckId(deckId);

        // Delete deck
        deckRepository.delete(deck);
    }
}

