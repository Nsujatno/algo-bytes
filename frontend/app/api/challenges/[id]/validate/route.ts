
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
        const timeVal = typeof time_taken === 'number' ? time_taken : null;

        // Pass user's timezone if available (could be header or body, defaulting to UTC)
        const userTimezone = request.headers.get('x-user-timezone') || 'UTC';

        const { attempt_history } = body; // Extract history from already parsed body
        const fullHistory = Array.isArray(attempt_history) ? [...attempt_history, emojiGrid] : [emojiGrid];

        // Atomic completion via RPC
        const { data: stats, error: rpcError } = await supabase.rpc('complete_challenge', {
            p_user_id: user.id,
            p_challenge_id: challenge.id,
            p_time_taken: timeVal,
            p_user_timezone: userTimezone,
            p_emoji_grid: fullHistory
        });

        if (rpcError) {
            console.error('Error completing challenge:', rpcError);
            return NextResponse.json({
                error: 'Database update failed',
                details: rpcError
            }, { status: 500 });
        } else if (stats && stats.length > 0) {
            const result = stats[0];
            return NextResponse.json({
                correct: allCorrect,
                results,
                emoji_grid: emojiGrid,
                message: allCorrect ? 'Challenge Completed!' : 'Some blocks are incorrect.',
                new_streak: result.new_streak,
                is_new_completion: result.is_new_completion
            });
        }
    }

    return NextResponse.json({
        correct: allCorrect,
        results,
        emoji_grid: emojiGrid,
        message: allCorrect ? 'Challenge Completed!' : 'Some blocks are incorrect.'
    });
}
