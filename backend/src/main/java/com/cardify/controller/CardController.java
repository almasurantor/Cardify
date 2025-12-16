package com.cardify.controller;

import com.cardify.dto.CardDto;
import com.cardify.dto.ReviewRequest;
import com.cardify.dto.CardProgressDto;
import com.cardify.entity.User;
import com.cardify.repository.UserRepository;
import com.cardify.service.CardService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class CardController {

    private final CardService cardService;
    private final UserRepository userRepository;

    public CardController(CardService cardService, UserRepository userRepository) {
        this.cardService = cardService;
        this.userRepository = userRepository;
    }

    @GetMapping("/decks/{deckId}/study")
    public ResponseEntity<List<CardDto>> getStudyCards(@PathVariable UUID deckId, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        try {
            List<CardDto> cards = cardService.getStudyCards(deckId, userId);
            return ResponseEntity.ok(cards);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/cards/{cardId}/review")
    public ResponseEntity<CardProgressDto> reviewCard(
            @PathVariable UUID cardId,
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        try {
            CardProgressDto progress = cardService.reviewCard(cardId, userId, request);
            return ResponseEntity.ok(progress);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/study/quick")
    public ResponseEntity<List<CardDto>> getQuickReviewCards(
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        List<CardDto> cards = cardService.getQuickReviewCards(userId, limit);
        return ResponseEntity.ok(cards);
    }

    private UUID getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}

