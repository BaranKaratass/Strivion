import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, User } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Match, TournamentParticipant } from '../types';

interface TournamentBracketProps {
    matches: Match[];
    participants: Record<string, TournamentParticipant>;
}

const ProfileNode = ({ 
    playerId, 
    participants, 
    isChampion = false, 
    size = 'normal', 
    highlight = 'default' 
}: { 
    playerId: string | null; 
    participants: Record<string, TournamentParticipant>; 
    isChampion?: boolean; 
    size?: 'normal' | 'large';
    highlight?: 'default' | 'blue' | 'purple' | 'amber';
}) => {
    const p = playerId ? participants[playerId] : null;
    const isLarge = size === 'large';
    
    return (
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative flex flex-col items-center justify-center w-24 h-28"
        >
            <div className={cn(
                "rounded-full border-[3px] flex items-center justify-center overflow-hidden bg-[#0a0a0c] z-10 relative transition-all duration-500",
                isLarge ? "w-20 h-20" : "w-14 h-14",
                isChampion ? "border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-[pulse_2s_ease-in-out_infinite]" :
                highlight === 'blue' ? "border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]" :
                highlight === 'purple' ? "border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]" :
                "border-slate-700 shadow-md"
            )}>
                {p?.avatarUrl ? (
                    <img src={p.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                    <User size={isLarge ? 32 : 24} className="text-slate-500" />
                )}
            </div>
            
            <span className={cn(
                "font-bold text-center w-full truncate px-1 mt-3 transition-colors",
                isChampion ? "text-amber-400 text-sm drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" : 
                p ? "text-slate-300 text-xs" : "text-slate-600 text-[10px] uppercase tracking-wider"
            )}>
                {p ? p.displayName : 'TBD'}
            </span>
        </motion.div>
    );
};

const RecursiveSide = ({ 
    match, 
    allMatches, 
    participants, 
    side 
}: { 
    match: Match; 
    allMatches: Match[]; 
    participants: Record<string, TournamentParticipant>; 
    side: 'left' | 'right';
}) => {
    if (!match) return null;
    
    const isLeft = side === 'left';
    const isRound1 = match.round === 1;

    const input1 = allMatches.find(m => m.round === match.round - 1 && m.matchIndex === match.matchIndex * 2);
    const input2 = allMatches.find(m => m.round === match.round - 1 && m.matchIndex === match.matchIndex * 2 + 1);

    const child1 = isRound1 ? <ProfileNode playerId={match.player1Id} participants={participants} /> : <RecursiveSide match={input1!} allMatches={allMatches} participants={participants} side={side} />;
    const child2 = isRound1 ? <ProfileNode playerId={match.player2Id} participants={participants} /> : <RecursiveSide match={input2!} allMatches={allMatches} participants={participants} side={side} />;

    const lineStyle = match.status === 'active' 
        ? (isLeft ? "border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]") 
        : "border-slate-700/50";
        
    const stemColor = match.status === 'active' ? (isLeft ? "bg-blue-500" : "bg-purple-500") : "bg-slate-700/50";
    const highlightColor = match.status === 'active' ? (isLeft ? 'blue' : 'purple') : 'default';

    return (
        <div className={cn("flex items-center", isLeft ? "flex-row" : "flex-row-reverse")}>
            <div className="flex flex-col justify-center gap-6">
                <div className="relative flex items-center py-2">
                    {child1}
                    <div className={cn(
                        "absolute w-8 top-1/2 bottom-0", lineStyle,
                        isLeft ? "right-[-2rem] border-r-2 border-t-2 rounded-tr-xl" : "left-[-2rem] border-l-2 border-t-2 rounded-tl-xl"
                    )} />
                </div>
                <div className="relative flex items-center py-2">
                    {child2}
                    <div className={cn(
                        "absolute w-8 top-0 bottom-1/2", lineStyle,
                        isLeft ? "right-[-2rem] border-r-2 border-b-2 rounded-br-xl" : "left-[-2rem] border-l-2 border-b-2 rounded-bl-xl"
                    )} />
                </div>
            </div>

            <div className="w-8" /> {/* Spacer covering the absolute connectors */}
            <div className={cn("w-8 h-[2px]", stemColor)} /> {/* Stem to the winner */}
            
            <div className={isLeft ? "ml-2" : "mr-2"}>
                <ProfileNode playerId={match.winnerId} participants={participants} highlight={highlightColor} />
            </div>
        </div>
    );
};

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ matches, participants }) => {
    if (!matches || matches.length === 0) return null;

    const maxRound = Math.max(...matches.map(m => m.round));
    const finalMatch = matches.find(m => m.round === maxRound);

    if (!finalMatch) return null;

    const leftMatch = matches.find(m => m.round === maxRound - 1 && m.matchIndex === 0);
    const rightMatch = matches.find(m => m.round === maxRound - 1 && m.matchIndex === 1);

    const isChampionDecided = finalMatch.status === 'completed' && !!finalMatch.winnerId;

    return (
        <div className="w-full overflow-x-auto py-16 hide-scrollbar relative">
            
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none mix-blend-overlay" />
            
            <div className="flex items-center justify-center min-w-max px-12 gap-6">
                
                {/* LEFT BRACKET */}
                {leftMatch && (
                    <RecursiveSide match={leftMatch} allMatches={matches} participants={participants} side="left" />
                )}

                {/* STEM TO FINAL (LEFT) */}
                {leftMatch && <div className="w-12 h-[2px] bg-blue-500/30" />}

                {/* CENTER FINAL */}
                <div className="flex flex-col items-center relative z-20">
                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="absolute -top-16 text-center"
                    >
                        <Trophy size={36} className={cn(
                            "mx-auto drop-shadow-xl transition-colors duration-700",
                            isChampionDecided ? "text-amber-400" : "text-slate-600"
                        )} />
                        <h3 className="text-xl font-black mt-2 tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                            Final
                        </h3>
                    </motion.div>

                    <ProfileNode 
                        playerId={finalMatch.winnerId} 
                        participants={participants} 
                        isChampion={isChampionDecided} 
                        size="large"
                        highlight={finalMatch.status === 'active' ? 'amber' : 'default'}
                    />
                </div>

                {/* STEM TO FINAL (RIGHT) */}
                {rightMatch && <div className="w-12 h-[2px] bg-purple-500/30" />}

                {/* RIGHT BRACKET */}
                {rightMatch && (
                    <RecursiveSide match={rightMatch} allMatches={matches} participants={participants} side="right" />
                )}
            </div>
        </div>
    );
};
