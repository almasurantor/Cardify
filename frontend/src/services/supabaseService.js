import { supabase } from '../lib/supabase'

// Decks
export async function getDecks(userId) {
  const { data: decks, error } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error

  // Get stats for each deck
  const decksWithStats = await Promise.all(
    decks.map(async (deck) => {
      // Get card count
      const { count: totalCards } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true })
        .eq('deck_id', deck.id)

      // Get mastered count
      const { data: cards } = await supabase
        .from('cards')
        .select('id')
        .eq('deck_id', deck.id)

      let masteredCards = 0
      if (cards && cards.length > 0) {
        const cardIds = cards.map(c => c.id)
        const { count } = await supabase
          .from('card_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'MASTERED')
          .in('card_id', cardIds)
        
        masteredCards = count || 0
      }

      const masteredPercent = (totalCards || 0) > 0 ? (masteredCards / totalCards) * 100 : 0

      return {
        id: deck.id,
        title: deck.title,
        subject: deck.subject,
        createdAt: deck.created_at,
        updatedAt: deck.updated_at,
        totalCards: totalCards || 0,
        masteredCards,
        masteredPercent,
      }
    })
  )

  return decksWithStats
}

export async function createDeck(userId, deckData) {
  // Create deck
  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .insert({
      user_id: userId,
      title: deckData.title,
      subject: deckData.subject || null,
    })
    .select()
    .single()

  if (deckError) throw deckError

  // Create cards
  if (deckData.cards && deckData.cards.length > 0) {
    const cardsToInsert = deckData.cards.map(card => ({
      deck_id: deck.id,
      front_text: card.frontText,
      back_text: card.backText,
      image_url: card.imageUrl || null,
    }))

    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .insert(cardsToInsert)
      .select()

    if (cardsError) throw cardsError

    // Initialize progress for all cards
    const progressToInsert = cards.map(card => ({
      user_id: userId,
      card_id: card.id,
      status: 'NEW',
      times_reviewed: 0,
      times_mastered: 0,
      times_struggled: 0,
    }))

    const { error: progressError } = await supabase
      .from('card_progress')
      .insert(progressToInsert)

    if (progressError) throw progressError
  }

  return {
    id: deck.id,
    title: deck.title,
    subject: deck.subject,
    createdAt: deck.created_at,
    updatedAt: deck.updated_at,
    totalCards: deckData.cards?.length || 0,
    masteredCards: 0,
    masteredPercent: 0,
  }
}

export async function getDeck(deckId, userId) {
  const { data: deck, error } = await supabase
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .eq('user_id', userId)
    .single()

  if (error) throw error

  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at')

  if (cardsError) throw cardsError

  // Get progress for each card
  const cardIds = cards.map(c => c.id)
  const { data: progress, error: progressError } = await supabase
    .from('card_progress')
    .select('*')
    .eq('user_id', userId)
    .in('card_id', cardIds)

  if (progressError) throw progressError

  const progressMap = new Map(progress.map(p => [p.card_id, p]))

  const cardsWithProgress = cards.map(card => ({
    id: card.id,
    frontText: card.front_text,
    backText: card.back_text,
    imageUrl: card.image_url,
    progress: progressMap.get(card.id) ? {
      status: progressMap.get(card.id).status,
      timesReviewed: progressMap.get(card.id).times_reviewed,
      timesMastered: progressMap.get(card.id).times_mastered,
      timesStruggled: progressMap.get(card.id).times_struggled,
    } : {
      status: 'NEW',
      timesReviewed: 0,
      timesMastered: 0,
      timesStruggled: 0,
    },
  }))

  const totalCards = cards.length
  const masteredCards = cardsWithProgress.filter(c => c.progress.status === 'MASTERED').length
  const masteredPercent = totalCards > 0 ? (masteredCards / totalCards) * 100 : 0

  return {
    id: deck.id,
    title: deck.title,
    subject: deck.subject,
    createdAt: deck.created_at,
    updatedAt: deck.updated_at,
    totalCards,
    masteredCards,
    masteredPercent,
    cards: cardsWithProgress,
  }
}

export async function deleteDeck(deckId, userId) {
  // Cards and progress will be deleted via CASCADE
  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId)
    .eq('user_id', userId)

  if (error) throw error
}

// Study
export async function getStudyCards(deckId, userId) {
  const { data: cards, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at')

  if (error) throw error

  const cardIds = cards.map(c => c.id)
  const { data: progress, error: progressError } = await supabase
    .from('card_progress')
    .select('*')
    .eq('user_id', userId)
    .in('card_id', cardIds)

  if (progressError) throw progressError

  const progressMap = new Map(progress.map(p => [p.card_id, p]))

  return cards.map(card => ({
    id: card.id,
    frontText: card.front_text,
    backText: card.back_text,
    imageUrl: card.image_url,
    progress: progressMap.get(card.id) ? {
      status: progressMap.get(card.id).status,
      timesReviewed: progressMap.get(card.id).times_reviewed,
      timesMastered: progressMap.get(card.id).times_mastered,
      timesStruggled: progressMap.get(card.id).times_struggled,
    } : {
      status: 'NEW',
      timesReviewed: 0,
      timesMastered: 0,
      timesStruggled: 0,
    },
  }))
}

export async function reviewCard(cardId, userId, action) {
  // Get or create progress
  const { data: existing, error: fetchError } = await supabase
    .from('card_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .single()

  let progress
  if (existing) {
    // Update existing
    const updates = {
      times_reviewed: existing.times_reviewed + 1,
      last_reviewed_at: new Date().toISOString(),
      status: action,
    }

    if (action === 'MASTERED') {
      updates.times_mastered = existing.times_mastered + 1
    } else if (action === 'STRUGGLING') {
      updates.times_struggled = existing.times_struggled + 1
    }

    const { data, error } = await supabase
      .from('card_progress')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    progress = data
  } else {
    // Create new
    const newProgress = {
      user_id: userId,
      card_id: cardId,
      status: action,
      times_reviewed: 1,
      times_mastered: action === 'MASTERED' ? 1 : 0,
      times_struggled: action === 'STRUGGLING' ? 1 : 0,
      last_reviewed_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('card_progress')
      .insert(newProgress)
      .select()
      .single()

    if (error) throw error
    progress = data
  }

  return {
    status: progress.status,
    timesReviewed: progress.times_reviewed,
    timesMastered: progress.times_mastered,
    timesStruggled: progress.times_struggled,
  }
}

export async function getQuickReviewCards(userId, limit = 10) {
  const { data, error } = await supabase
    .from('card_progress')
    .select(`
      *,
      cards(*)
    `)
    .eq('user_id', userId)
    .neq('status', 'MASTERED')
    .order('status', { ascending: false })
    .order('last_reviewed_at', { ascending: true, nullsFirst: true })
    .limit(limit)

  if (error) throw error

  return data
    .filter(item => item.cards)
    .map(item => ({
      id: item.cards.id,
      frontText: item.cards.front_text,
      backText: item.cards.back_text,
      imageUrl: item.cards.image_url,
      progress: {
        status: item.status,
        timesReviewed: item.times_reviewed,
        timesMastered: item.times_mastered,
        timesStruggled: item.times_struggled,
      },
    }))
}

// Dashboard Stats
export async function getDashboardStats(userId) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: mastered, error: masteredError } = await supabase
    .from('card_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'MASTERED')

  const { count: struggling, error: strugglingError } = await supabase
    .from('card_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'STRUGGLING')

  const { count: reviewedToday, error: reviewedError } = await supabase
    .from('card_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('last_reviewed_at', today.toISOString())

  if (masteredError || strugglingError || reviewedError) {
    throw new Error('Failed to fetch stats')
  }

  return {
    masteredCards: mastered || 0,
    strugglingCards: struggling || 0,
    reviewedToday: reviewedToday || 0,
  }
}

