
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Body
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { solution, time_taken } = body; // solution should be string[] (block IDs)

    if (!Array.isArray(solution)) {
        return NextResponse.json({ error: 'Solution must be an array of block IDs' }, { status: 400 });
    }

    // 3. Fetch Challenge
    const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

    if (challengeError || !challenge) {
        return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // 4. Validation Logic
    const { code_blocks, total_slots } = challenge.challenge_data;

    if (solution.length !== total_slots) {
        return NextResponse.json({
            error: `Solution length (${solution.length}) does not match required slots (${total_slots})`
        }, { status: 400 });
    }

    // Create a map of correct position -> block ID
    const correctMap = new Map<number, string>();
    code_blocks.forEach((block: any) => {
        if (typeof block.correct_position === 'number') {
            correctMap.set(block.correct_position, block.id);
        }
    });

    const results: boolean[] = [];
    let allCorrect = true;
    let emojiGrid = '';

    for (let i = 0; i < total_slots; i++) {
        const userBlockId = solution[i];
        const correctBlockId = correctMap.get(i);

        // Check if the user's block matches the correct block for this position
        const isCorrect = userBlockId === correctBlockId;

        results.push(isCorrect);
        if (!isCorrect) allCorrect = false;
        emojiGrid += isCorrect ? '🟩' : '🟥';
    }

    // 5. Update Progress if Correct
    if (allCorrect) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const { error: progressError } = await supabase
            .from('user_progress')
            .upsert({
                user_id: user.id,
                challenge_id: challenge.id,
                completed: true,
                completed_at: now.toISOString(),
                time_taken: typeof time_taken === 'number' ? time_taken : null
            }, {
                onConflict: 'user_id,challenge_id'
            });

        if (progressError) {
            console.error('Error updating progress:', progressError);
        }

        const { data: profile, error: profileFetchError } = await supabase
            .from('profiles')
            .select('streak_count, last_played_date, completed_challenges')
            .eq('id', user.id)
            .single();

        if (profile) {
            let newStreak = profile.streak_count || 0;
            const lastPlayed = profile.last_played_date;

            // Streak Logic
            if (lastPlayed === today) {
                // Already played today, streak stays same
            } else {
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (lastPlayed === yesterdayStr) {
                    newStreak += 1; // Continued streak
                } else {
                    newStreak = 1; // Broken streak or first time
                }
            }

            // Array Logic
            let newCompleted = profile.completed_challenges || [];
            if (!Array.isArray(newCompleted)) newCompleted = [];
            if (!newCompleted.includes(challenge.id)) {
                newCompleted.push(challenge.id);
            }

            await supabase
                .from('profiles')
                .update({
                    streak_count: newStreak,
                    last_played_date: today,
                    completed_challenges: newCompleted
                })
                .eq('id', user.id);
        }
    }

    return NextResponse.json({
        correct: allCorrect,
        results,
        emoji_grid: emojiGrid,
        message: allCorrect ? 'Challenge Completed!' : 'Some blocks are incorrect.'
    });
}
