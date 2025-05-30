import { ReactNode } from 'react';
import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export type UserPlan = 'free' | 'starter' | 'pro';

export interface UserPlanData {
  plan: UserPlan;
  pointsLeft: number;
  startDate: Timestamp;
}

export interface AuthContextProps {
  user: User | null;
  loading: boolean;
  userPlan: UserPlanData | null;
  canUseFeature: (feature: string) => boolean;
  updateUserPlan: (uid: string, plan: UserPlan, points: number) => Promise<void>;
  checkAndResetPoints: () => Promise<void>;
}

export function useAuth(): AuthContextProps;
export function AuthProvider({ children }: { children: ReactNode }): JSX.Element; 