export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  coins: number;
  level: number;
  createdAt: number;
  updatedAt: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend';
  reason: string;
  timestamp: number;
}
