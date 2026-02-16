
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch Practice Challenges
    const { data: challenges, error } = await supabase
        .from('challenges')
        .select('id, title, difficulty, algorithm_category')
        .eq('is_daily', false)
        .order('created_at', { ascending: true });

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
    }

    // 2. Determine Status (Locked/Available/Completed)
    const challengesWithStatus = await Promise.all(challenges.map(async (challenge) => {
        let status = 'locked'; // Default

        if (user) {
            const { data: progress } = await supabase
                .from('user_progress')
                .select('completed')
                .eq('user_id', user.id)
                .eq('challenge_id', challenge.id)
                .maybeSingle();

            if (progress) {
                status = progress.completed ? 'completed' : 'available';
            }
        }

        return {
            ...challenge,
            status
        };
    }));

    return NextResponse.json(challengesWithStatus);
}
