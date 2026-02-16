'use client';

import { useEffect, useState, use } from 'react';
import { ChallengeInterface } from '@/components/challenge/challenge-interface';
import { Challenge } from '@/types/challenge';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ChallengePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ChallengePage({ params }: ChallengePageProps) {
  // Unwrap params using React.use()
  const { id } = use(params);
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChallenge() {
      try {
        const res = await fetch(`/api/challenges/${id}`);
        if (!res.ok) {
            if (res.status === 401) {
                // Handle unauthorized (redirect logic could go here or be handled by middleware)
                setError("You must be logged in.");
                return;
            }
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        setChallenge(data);
      } catch (err: any) {
        console.error("Failed to fetch challenge:", err);
        setError(err.message || "Failed to load challenge");
      } finally {
        setLoading(false);
      }
    }

    fetchChallenge();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background text-foreground gap-4">
        <h1 className="text-xl font-bold">Unable to load challenge</h1>
        <p className="text-muted-foreground">{error || "Challenge not found"}</p>
        <Button variant="outline" asChild>
            <Link href="/">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <ChallengeInterface challenge={challenge} />
    </div>
  );
}
