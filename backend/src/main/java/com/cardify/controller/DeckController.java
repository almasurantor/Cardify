package com.cardify.controller;

import com.cardify.dto.CreateDeckRequest;
import com.cardify.dto.DeckDto;
import com.cardify.entity.User;
import com.cardify.repository.UserRepository;
import com.cardify.service.DeckService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/decks")
@CrossOrigin
public class DeckController {

    private final DeckService deckService;
    private final UserRepository userRepository;

    public DeckController(DeckService deckService, UserRepository userRepository) {
        this.deckService = deckService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<DeckDto>> getUserDecks(Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        List<DeckDto> decks = deckService.getUserDecks(userId);
        return ResponseEntity.ok(decks);
    }

    @PostMapping
    public ResponseEntity<DeckDto> createDeck(@Valid @RequestBody CreateDeckRequest request, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        DeckDto deck = deckService.createDeck(userId, request);
        return ResponseEntity.ok(deck);
    }

    @GetMapping("/{deckId}")
    public ResponseEntity<DeckDto> getDeck(@PathVariable UUID deckId, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        try {
            DeckDto deck = deckService.getDeck(deckId, userId);
            return ResponseEntity.ok(deck);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{deckId}")
    public ResponseEntity<Void> deleteDeck(@PathVariable UUID deckId, Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);
        try {
            deckService.deleteDeck(deckId, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private UUID getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}

