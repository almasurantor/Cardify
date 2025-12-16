package com.cardify.config;

import com.cardify.entity.*;
import com.cardify.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DeckRepository deckRepository;
    private final CardRepository cardRepository;
    private final CardProgressRepository cardProgressRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            UserRepository userRepository,
            DeckRepository deckRepository,
            CardRepository cardRepository,
            CardProgressRepository cardProgressRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.deckRepository = deckRepository;
        this.cardRepository = cardRepository;
        this.cardProgressRepository = cardProgressRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Only seed if no users exist
        if (userRepository.count() > 0) {
            return;
        }

        // Create test user
        User user = new User();
        user.setEmail("test@cardify.com");
        user.setPasswordHash(passwordEncoder.encode("password123"));
        user = userRepository.save(user);

        // Create sample deck
        Deck deck = new Deck();
        deck.setUserId(user.getId());
        deck.setTitle("Sample Biology Deck");
        deck.setSubject("Biology");
        deck = deckRepository.save(deck);

        // Create sample cards
        List<String[]> cardData = Arrays.asList(
            new String[]{"What is the powerhouse of the cell?", "Mitochondria"},
            new String[]{"What is the basic unit of life?", "Cell"},
            new String[]{"What process do plants use to make food?", "Photosynthesis"},
            new String[]{"What is DNA short for?", "Deoxyribonucleic acid"},
            new String[]{"What are the building blocks of proteins?", "Amino acids"}
        );

        for (String[] data : cardData) {
            Card card = new Card();
            card.setDeckId(deck.getId());
            card.setFrontText(data[0]);
            card.setBackText(data[1]);
            card = cardRepository.save(card);

            // Create progress for some cards
            CardProgress progress = new CardProgress();
            progress.setUserId(user.getId());
            progress.setCardId(card.getId());
            if (cardData.indexOf(data) < 2) {
                progress.setStatus(CardProgress.ProgressStatus.MASTERED);
                progress.setTimesMastered(1);
            } else {
                progress.setStatus(CardProgress.ProgressStatus.NEW);
            }
            progress.setTimesReviewed(0);
            progress.setTimesStruggled(0);
            cardProgressRepository.save(progress);
        }

        System.out.println("Sample data seeded successfully!");
        System.out.println("Test user: test@cardify.com / password123");
    }
}

