export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  coins: number;
  level: number;
  favoriteGames: string[];
  privacy: PrivacySettings;
  stats: UserStats;
  createdAt: number;
  updatedAt: number;
}

export interface PrivacySettings {
  showTournaments: boolean;
  showStats: boolean;
  showOnlineStatus: boolean;
}

export interface UserStats {
  totalMatches: number;
  wins: number;
  losses: number;
  tournamentsJoined: number;
  tournamentsWon: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend';
  reason: string;
  timestamp: number;
}

// ─── Tournament Types ─────────────────────────────────────

export type TournamentStatus = 'waiting' | 'active' | 'completed';

export interface Tournament {
  id: string;
  code: string;
  title: string;
  description: string;
  game: string;
  ownerId: string;
  ownerName: string;
  maxParticipants: number;
  minRank: string;
  maxRank: string;
  status: TournamentStatus;
  isPrivate: boolean;
  prizePool: number;
  participantIds: string[];
  createdAt: number;
  startedAt: number | null;
  completedAt: number | null;
}

export interface TournamentParticipant {
  uid: string;
  displayName: string;
  avatarUrl: string;
  joinedAt: number;
  status: 'active' | 'eliminated' | 'winner';
}

export interface CreateTournamentData {
  title: string;
  description: string;
  game: string;
  maxParticipants: number;
  minRank: string;
  maxRank: string;
  isPrivate: boolean;
  prizePool: number;
}

