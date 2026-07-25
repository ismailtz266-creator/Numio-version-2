import { supabase } from './supabaseClient'

// ── Profile / Coins ───────────────────────────────────────────────

export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error && error.code === 'PGRST116') {
    // Profile doesn't exist yet — create it
    const { data: created } = await supabase
      .from('profiles')
      .insert({ id: user.id, coin_balance: 0 })
      .select()
      .single()
    return created
  }
  return data
}

export async function addCoins(amount) {
  const { data: { user } } = await supabase.auth.getUser()
  const profile = await getProfile()
  const newBalance = (profile?.coin_balance || 0) + amount
  const { data } = await supabase
    .from('profiles')
    .update({ coin_balance: newBalance })
    .eq('id', user.id)
    .select()
    .single()
  return data
}

export async function getCoinBalance() {
  const profile = await getProfile()
  return profile?.coin_balance || 0
}

// ── Rewards ───────────────────────────────────────────────────────

export async function getRewards() {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .order('cost', { ascending: true })
  if (error) throw error
  return data
}

export async function createReward({ name, cost }) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('rewards')
    .insert({ name, cost, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteReward(id) {
  const { error } = await supabase.from('rewards').delete().eq('id', id)
  if (error) throw error
}

// ── Claims ────────────────────────────────────────────────────────

export async function getClaims() {
  const { data, error } = await supabase
    .from('claims')
    .select('*, rewards(name, cost)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function claimReward(rewardId, rewardCost) {
  const { data: { user } } = await supabase.auth.getUser()

  // Deduct coins
  const profile = await getProfile()
  const newBalance = (profile?.coin_balance || 0) - rewardCost
  if (newBalance < 0) throw new Error('Not enough coins')

  await supabase
    .from('profiles')
    .update({ coin_balance: newBalance })
    .eq('id', user.id)

  // Create claim
  const { data, error } = await supabase
    .from('claims')
    .insert({ reward_id: rewardId, user_id: user.id, status: 'pending' })
    .select()
    .single()
  if (error) throw error
  return { claim: data, newBalance }
}

export async function approveClaim(claimId) {
  const { error } = await supabase
    .from('claims')
    .update({ status: 'approved' })
    .eq('id', claimId)
  if (error) throw error
}

// ── Streak ────────────────────────────────────────────────────────

export async function getStreak() {
  const profile = await getProfile()
  return {
    count: profile?.streak_count || 0,
    lastDate: profile?.streak_last_date || null,
  }
}

/**
 * Call after every completed quiz.
 * - If last quiz was yesterday → increment streak
 * - If last quiz was today → no change
 * - If last quiz was 2+ days ago → reset to 1
 * Returns { streakCount, isNewDay, previousStreak }
 */
export async function updateStreak() {
  const { data: { user } } = await supabase.auth.getUser()
  const profile = await getProfile()

  const today = new Date().toISOString().slice(0, 10) // "2026-07-24"
  const lastDate = profile?.streak_last_date || null
  const currentStreak = profile?.streak_count || 0

  // Already completed a quiz today — no change
  if (lastDate === today) {
    return { streakCount: currentStreak, isNewDay: false, previousStreak: currentStreak }
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  let newStreak
  if (lastDate === yesterdayStr) {
    newStreak = currentStreak + 1 // consecutive day
  } else {
    newStreak = 1 // reset
  }

  await supabase
    .from('profiles')
    .update({ streak_count: newStreak, streak_last_date: today })
    .eq('id', user.id)

  return { streakCount: newStreak, isNewDay: true, previousStreak: currentStreak }
}
