package com.cardify.service;

import com.cardify.dto.CardRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class CardGenerationService {

    @Value("${ai.enabled:false}")
    private boolean aiEnabled;

    @Value("${ai.api-key:}")
    private String aiApiKey;

    private final Random random = new Random();

    public List<CardRequest> generateCards(String topic, int count) {
        // For MVP, use mock generation based on topic keywords
        // In production, this would call an AI API
        
        String topicLower = topic.toLowerCase();
        List<CardRequest> cards = new ArrayList<>();

        if (topicLower.contains("animal") || topicLower.contains("zoo")) {
            cards = generateAnimalCards(count);
        } else if (topicLower.contains("chem") || topicLower.contains("acid") || topicLower.contains("base")) {
            cards = generateChemistryCards(count);
        } else if (topicLower.contains("math") || topicLower.contains("algebra")) {
            cards = generateMathCards(count);
        } else if (topicLower.contains("history")) {
            cards = generateHistoryCards(count);
        } else {
            cards = generateGenericCards(topic, count);
        }

        return cards;
    }

    private List<CardRequest> generateAnimalCards(int count) {
        String[][] animalFacts = {
            {"What is the largest mammal?", "Blue whale"},
            {"What is the fastest land animal?", "Cheetah"},
            {"What animal is known as the king of the jungle?", "Lion"},
            {"What is a group of lions called?", "Pride"},
            {"What is the smallest mammal?", "Bumblebee bat"},
            {"What animal has the longest neck?", "Giraffe"},
            {"What is a baby kangaroo called?", "Joey"},
            {"What is the largest bird?", "Ostrich"},
            {"What animal is known for changing colors?", "Chameleon"},
            {"What is a group of elephants called?", "Herd"},
            {"What is the largest reptile?", "Saltwater crocodile"},
            {"What animal sleeps the most?", "Koala"},
            {"What is the national animal of India?", "Tiger"},
            {"What animal has the best memory?", "Elephant"},
            {"What is a group of crows called?", "Murder"},
            {"What is the smallest bird?", "Bee hummingbird"},
            {"What animal is known for its trunk?", "Elephant"},
            {"What is the largest fish?", "Whale shark"},
            {"What animal is the symbol of wisdom?", "Owl"},
            {"What is a group of wolves called?", "Pack"}
        };
        return generateFromTemplate(animalFacts, count);
    }

    private List<CardRequest> generateChemistryCards(int count) {
        String[][] chemFacts = {
            {"What is the chemical symbol for water?", "H2O"},
            {"What is the pH of a neutral solution?", "7"},
            {"What is the most abundant element in the universe?", "Hydrogen"},
            {"What is the chemical formula for table salt?", "NaCl"},
            {"What is the pH of an acid?", "Less than 7"},
            {"What is the pH of a base?", "Greater than 7"},
            {"What is the chemical symbol for gold?", "Au"},
            {"What is the atomic number of carbon?", "6"},
            {"What is the chemical formula for carbon dioxide?", "CO2"},
            {"What is the most common gas in Earth's atmosphere?", "Nitrogen"},
            {"What is the chemical symbol for iron?", "Fe"},
            {"What is the chemical formula for methane?", "CH4"},
            {"What is the process of rusting called?", "Oxidation"},
            {"What is the chemical symbol for oxygen?", "O"},
            {"What is the pH scale range?", "0 to 14"},
            {"What is the chemical formula for glucose?", "C6H12O6"},
            {"What is the most reactive element?", "Francium"},
            {"What is the chemical symbol for silver?", "Ag"},
            {"What is the process of splitting water called?", "Electrolysis"},
            {"What is the chemical formula for ammonia?", "NH3"}
        };
        return generateFromTemplate(chemFacts, count);
    }

    private List<CardRequest> generateMathCards(int count) {
        String[][] mathFacts = {
            {"What is 2 + 2?", "4"},
            {"What is the square root of 16?", "4"},
            {"What is 5 × 5?", "25"},
            {"What is the value of π (pi)?", "3.14159..."},
            {"What is 10 ÷ 2?", "5"},
            {"What is the square of 9?", "81"},
            {"What is 3 to the power of 3?", "27"},
            {"What is the square root of 25?", "5"},
            {"What is 7 × 8?", "56"},
            {"What is 100 ÷ 4?", "25"},
            {"What is the area of a circle formula?", "πr²"},
            {"What is the perimeter of a square?", "4 × side"},
            {"What is 15 + 15?", "30"},
            {"What is 12 × 12?", "144"},
            {"What is 50 ÷ 5?", "10"},
            {"What is the square root of 36?", "6"},
            {"What is 9 × 7?", "63"},
            {"What is 20 ÷ 4?", "5"},
            {"What is the area of a rectangle?", "length × width"},
            {"What is 6 to the power of 2?", "36"}
        };
        return generateFromTemplate(mathFacts, count);
    }

    private List<CardRequest> generateHistoryCards(int count) {
        String[][] historyFacts = {
            {"When did World War II end?", "1945"},
            {"Who was the first President of the United States?", "George Washington"},
            {"When did the American Civil War begin?", "1861"},
            {"Who wrote the Declaration of Independence?", "Thomas Jefferson"},
            {"When did the Berlin Wall fall?", "1989"},
            {"Who was the first man on the moon?", "Neil Armstrong"},
            {"When did World War I begin?", "1914"},
            {"Who was the leader of Nazi Germany?", "Adolf Hitler"},
            {"When did the Renaissance period begin?", "14th century"},
            {"Who was the first female Prime Minister of the UK?", "Margaret Thatcher"},
            {"When did the French Revolution begin?", "1789"},
            {"Who discovered America?", "Christopher Columbus"},
            {"When did the Industrial Revolution begin?", "18th century"},
            {"Who was the first Emperor of Rome?", "Augustus"},
            {"When did the Cold War end?", "1991"},
            {"Who was the first person to circumnavigate the globe?", "Ferdinand Magellan"},
            {"When did the Great Depression begin?", "1929"},
            {"Who was the first woman to win a Nobel Prize?", "Marie Curie"},
            {"When did the Russian Revolution occur?", "1917"},
            {"Who was the first person to reach the South Pole?", "Roald Amundsen"}
        };
        return generateFromTemplate(historyFacts, count);
    }

    private List<CardRequest> generateGenericCards(String topic, int count) {
        List<CardRequest> cards = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            CardRequest card = new CardRequest();
            card.setFrontText("What is " + topic + " " + i + "?");
            card.setBackText("Definition or answer for " + topic + " " + i);
            cards.add(card);
        }
        return cards;
    }

    private List<CardRequest> generateFromTemplate(String[][] templates, int count) {
        List<CardRequest> cards = new ArrayList<>();
        List<Integer> used = new ArrayList<>();
        
        int actualCount = Math.min(count, templates.length);
        
        for (int i = 0; i < actualCount; i++) {
            int index;
            do {
                index = random.nextInt(templates.length);
            } while (used.contains(index) && used.size() < templates.length);
            
            used.add(index);
            
            CardRequest card = new CardRequest();
            card.setFrontText(templates[index][0]);
            card.setBackText(templates[index][1]);
            cards.add(card);
        }
        
        return cards;
    }
}

