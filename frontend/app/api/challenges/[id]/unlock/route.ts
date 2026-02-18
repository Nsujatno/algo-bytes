
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

    // Unlock via RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('unlock_challenge', {
        p_user_id: user.id,
        p_challenge_id: id
    });

    if (rpcError) {
        console.error("Unlock error:", rpcError);
        // Handle exception
        if (rpcError.message.includes('Insufficient credits')) {
            return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to unlock challenge' }, { status: 500 });
    }

    const result = Array.isArray(rpcData) && rpcData.length > 0 ? rpcData[0] : null;

    if (!result) {
        return NextResponse.json({ error: 'Unexpected response from unlock operation' }, { status: 500 });
    }

    return NextResponse.json({ success: result.success, remaining_credits: result.remaining_credits });
}
