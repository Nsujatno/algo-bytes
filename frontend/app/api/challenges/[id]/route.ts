
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: challenge, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !challenge) {
        return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    let isCompleted = false;
    let streakCount = 0;
    let timeTaken = 0;
    let emojiGrid: string[] = [];

    if (user) {
        const { data: progress } = await supabase
            .from('user_progress')
            .select('completed, time_taken, emoji_grid')
            .eq('user_id', user.id)
            .eq('challenge_id', id)
            .single();

        if (progress?.completed) {
            isCompleted = true;
            timeTaken = progress.time_taken || 0;
            // Handle if it's already an array (new data) or string (old data - shouldn't happen after migration but good to be safe)
            emojiGrid = Array.isArray(progress.emoji_grid) ? progress.emoji_grid : (progress.emoji_grid ? [progress.emoji_grid] : []);
        }

        // Fetch user's streak count
        const { data: profile } = await supabase
            .from('profiles')
            .select('streak_count')
            .eq('id', user.id)
            .single();

        if (profile) {
            streakCount = profile.streak_count ?? 0;
        }
    }

    return NextResponse.json({
        ...challenge,
        completed: isCompleted,
        streak_count: streakCount,
        time_taken: timeTaken,
        emoji_grid: emojiGrid
    });
}
