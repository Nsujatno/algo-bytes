
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const today = new Date().toISOString().split('T')[0];

    const { data: challenge, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_daily', true)
        .eq('daily_date', today)
        .maybeSingle();

    if (error) {
        console.error("Error fetching daily challenge:", error);
        return NextResponse.json({ error: 'Failed to fetch challenge' }, { status: 500 });
    }

    if (!challenge) {
        return NextResponse.json({ error: 'No challenge scheduled for today' }, { status: 404 });
    }
    let isCompleted = false;
    let streak = 0;

    if (user) {
        const { data: progress } = await supabase
            .from('user_progress')
            .select('completed')
            .eq('user_id', user.id)
            .eq('challenge_id', challenge.id)
            .single();

        if (progress?.completed) {
            isCompleted = true;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('streak_count')
            .eq('id', user.id)
            .single();

        if (profile) {
            streak = profile.streak_count || 0;
        }
    }

    return NextResponse.json({
        ...challenge,
        completed: isCompleted,
        streak: streak
    });
}
