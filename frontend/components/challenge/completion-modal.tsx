'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Home, Clock, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';

interface CompletionModalProps {
    isOpen: boolean;
    challengeTitle: string;
    timeTaken: number;
    streakCount: number;
    attemptHistory: string[]; // Emoji grid
    onClose: () => void;
}

export function CompletionModal({
    isOpen,
    challengeTitle,
    timeTaken,
    streakCount,
    attemptHistory,
    onClose
}: CompletionModalProps) {
    const [isCopied, setIsCopied] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 9999
            });
        }
    }, [isOpen]);

    const handleShare = () => {
        const streakText = streakCount ? `🔥 ${streakCount} day streak\n` : '';
        const historyGrid = attemptHistory.join('\n');
        const text = `Algobytes ${new Date().toLocaleDateString()}\n${challengeTitle}\n⏱️ ${timeTaken}s\n${streakText}✅ Solved!\n\n${historyGrid}`;
        
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleHome = () => {
        router.push('/');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="w-full max-w-md relative"
                    >
                        <Card className="border-accent/50 shadow-2xl relative overflow-hidden bg-surface/95 backdrop-blur">
                             {/* Decorative glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
                            
                            <CardHeader className="text-center pt-8 pb-4 relative z-10">
                                <div className="mx-auto bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 ring-1 ring-green-500/20">
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                </div>
                                <CardTitle className="text-2xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                                    Challenge Complete!
                                </CardTitle>
                                <p className="text-muted-foreground text-sm">You crushed it today.</p>
                            </CardHeader>

                            <CardContent className="space-y-6 relative z-10">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-background/50 p-4 rounded-lg border border-border flex flex-col items-center">
                                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1 uppercase tracking-wider">
                                            <Clock className="w-3 h-3" /> Time
                                        </div>
                                        <div className="text-xl font-mono font-bold text-foreground">
                                            {timeTaken}s
                                        </div>
                                    </div>
                                    <div className="bg-background/50 p-4 rounded-lg border border-border flex flex-col items-center">
                                       <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1 uppercase tracking-wider">
                                            <Zap className="w-3 h-3 text-yellow-500" /> Streak
                                        </div>
                                        <div className="text-xl font-mono font-bold text-yellow-500">
                                            {streakCount}
                                        </div>
                                    </div>
                                </div>

                                {/* Emoji Pattern */}
                                {attemptHistory.length > 0 && (
                                    <div className="bg-black/20 rounded-lg p-4 text-center border border-border/50">
                                        <div className="text-xs text-muted-foreground mb-2 font-medium">ATTEMPT PATTERN</div>
                                        <div className="font-mono text-lg leading-relaxed tracking-widest whitespace-pre-wrap select-none opacity-90">
                                            {attemptHistory.map((line, i) => (
                                                <div key={i}>{line}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="flex flex-col gap-3 pt-2 pb-8 relative z-10">
                                <Button 
                                    onClick={handleShare}
                                    className="w-full gap-2 font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transform hover:scale-[1.02] transition-all"
                                    size="lg"
                                >
                                    {isCopied ? "Copied to Clipboard!" : <>Share Result <Share2 className="w-4 h-4" /></>}
                                </Button>
                                
                                <Button 
                                    variant="ghost" 
                                    onClick={handleHome}
                                    className="w-full text-muted-foreground hover:text-foreground"
                                >
                                    <Home className="w-4 h-4 mr-2" /> Back to Dashboard
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
