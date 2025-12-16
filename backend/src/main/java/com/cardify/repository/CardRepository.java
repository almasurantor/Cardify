package com.cardify.repository;

import com.cardify.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CardRepository extends JpaRepository<Card, UUID> {
    List<Card> findByDeckId(UUID deckId);
    void deleteByDeckId(UUID deckId);
}

