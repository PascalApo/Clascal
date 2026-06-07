export type UserId = 'user1' | 'user2';

export interface UserProfile {
  id: UserId;
  name: string;
  accentColor: string;
}

export const USER_BASE: Record<UserId, Pick<UserProfile, 'id' | 'name'>> = {
  user1: { id: 'user1', name: 'Clara' },
  user2: { id: 'user2', name: 'Pascal' },
};
