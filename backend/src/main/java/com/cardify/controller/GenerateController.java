package com.cardify.controller;

import com.cardify.dto.CardRequest;
import com.cardify.dto.GenerateCardsRequest;
import com.cardify.service.CardGenerationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/generate")
@CrossOrigin
public class GenerateController {

    private final CardGenerationService cardGenerationService;

    public GenerateController(CardGenerationService cardGenerationService) {
        this.cardGenerationService = cardGenerationService;
    }

    @PostMapping
    public ResponseEntity<Map<String, List<CardRequest>>> generateCards(@Valid @RequestBody GenerateCardsRequest request) {
        List<CardRequest> cards = cardGenerationService.generateCards(request.getTopic(), request.getCount());
        Map<String, List<CardRequest>> response = new HashMap<>();
        response.put("cards", cards);
        return ResponseEntity.ok(response);
    }
}

