# Supabase Setup

This directory contains the database schema for Cardify.

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `schema.sql`
4. Click **Run** to execute the SQL

This will create:
- All necessary tables (decks, cards, card_progress)
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates

## What Gets Created

### Tables
- **decks**: User's flashcard decks
- **cards**: Individual flashcards
- **card_progress**: User progress tracking

### Security
- Row Level Security enabled on all tables
- Users can only access their own data
- Policies automatically enforce user isolation

### Features
- Automatic `updated_at` timestamp on decks
- Unique constraints to prevent duplicate progress entries
- Foreign key constraints for data integrity

