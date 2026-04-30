import { collection, doc, writeBatch, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Match, MatchStatus } from '../types';

/**
 * Creates a single-elimination bracket for the given participants.
 * Assumes participants.length is a power of 2 (4, 8, 16, 32, 64).
 */
export const generateBracket = async (tournamentId: string, participantIds: string[]): Promise<{ success: boolean; error?: string }> => {
    try {
        const numParticipants = participantIds.length;
        
        // Ensure numParticipants is a power of 2
        if (![4, 8, 16, 32, 64].includes(numParticipants)) {
            return { success: false, error: 'Katılımcı sayısı 4, 8, 16, 32 veya 64 olmalıdır.' };
        }

        // Shuffle participants for random seeding (Basic seeding)
        const shuffled = [...participantIds].sort(() => Math.random() - 0.5);

        const totalRounds = Math.log2(numParticipants);
        const matches: Match[] = [];
        const matchesByRound: Match[][] = Array.from({ length: totalRounds }, () => []);

        const batch = writeBatch(db);
        const matchesRef = collection(db, `tournaments/${tournamentId}/matches`);

        // Create matches from Final backwards to Quarterfinals
        // Round 0 = Final, Round 1 = Semifinals, ..., Round totalRounds - 1 = First Round
        // But for UI visualization, it's easier to think of Round 1 as First Round, Round totalRounds as Final.
        // Let's use Round 1 = First Round, Round totalRounds = Final.

        let currentMatchIdCounter = 1;
        const generateMatchId = () => `match_${currentMatchIdCounter++}`;

        // Create the structure first
        for (let round = totalRounds; round >= 1; round--) {
            const matchesInRound = Math.pow(2, totalRounds - round);
            for (let i = 0; i < matchesInRound; i++) {
                const matchId = generateMatchId();
                const match: Match = {
                    id: matchId,
                    tournamentId,
                    round,
                    matchIndex: i,
                    player1Id: null,
                    player2Id: null,
                    winnerId: null,
                    nextMatchId: null, // Will be linked next
                    status: 'pending' as MatchStatus,
                };
                matchesByRound[round - 1].push(match);
                matches.push(match);
            }
        }

        // Link nextMatchId
        for (let round = 1; round < totalRounds; round++) {
            const currentRoundMatches = matchesByRound[round - 1];
            const nextRoundMatches = matchesByRound[round];

            for (let i = 0; i < currentRoundMatches.length; i++) {
                // Every 2 matches go to 1 next match
                const nextMatchIndex = Math.floor(i / 2);
                currentRoundMatches[i].nextMatchId = nextRoundMatches[nextMatchIndex].id;
            }
        }

        // Populate First Round (Round 1) with players
        const firstRoundMatches = matchesByRound[0];
        let playerIndex = 0;
        for (const match of firstRoundMatches) {
            match.player1Id = shuffled[playerIndex++];
            match.player2Id = shuffled[playerIndex++];
            match.status = 'active'; // First round matches are immediately active
        }

        // Save all matches to Firestore in a batch
        for (const match of matches) {
            const docRef = doc(matchesRef, match.id);
            batch.set(docRef, match);
        }

        await batch.commit();
        return { success: true };

    } catch (error: any) {
        console.error('Error generating bracket:', error);
        return { success: false, error: error.message };
    }
};

export const getTournamentMatches = async (tournamentId: string): Promise<Match[]> => {
    try {
        const matchesRef = collection(db, `tournaments/${tournamentId}/matches`);
        const snapshot = await getDocs(matchesRef);
        
        const matches = snapshot.docs.map(doc => doc.data() as Match);
        
        // Sort in memory to avoid Firestore composite index requirement
        return matches.sort((a, b) => {
            if (a.round === b.round) {
                return a.matchIndex - b.matchIndex;
            }
            return a.round - b.round;
        });
    } catch (error) {
        console.error('Error fetching matches:', error);
        return [];
    }
};
