
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Check Credits
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('practice_credits')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.practice_credits < 1) {
        return NextResponse.json({ error: 'Insuffient credits' }, { status: 400 });
    }

    // 2. Deduct Credit
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ practice_credits: profile.practice_credits - 1 })
        .eq('id', user.id);

    if (updateError) {
        return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
    }

    // 3. Unlock Challenge (Create progress entry)
    const { error: unlockError } = await supabase
        .from('user_progress')
        .insert({
            user_id: user.id,
            challenge_id: id,
            completed: false,
            time_taken: null
        });

    if (unlockError) {
        // Rollback credit? keeping simple for now
        console.error("Unlock error:", unlockError);
        return NextResponse.json({ error: 'Failed to unlock challenge' }, { status: 500 });
    }

    return NextResponse.json({ success: true, remaining_credits: profile.practice_credits - 1 });
}
