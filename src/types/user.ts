export type UserId = 'user1' | 'user2';

export interface UserProfile {
  id: string;
  name: string;
  accentColor: string;
}

export const USER_BASE: Record<UserId, Pick<UserProfile, 'id' | 'name'>> = {
  user1: { id: 'user1', name: 'Clara' },
  user2: { id: 'user2', name: 'Pascal' },
};

export function getPartnerUserId(userId: UserId): UserId {
  return userId === 'user1' ? 'user2' : 'user1';
}

export function getPartnerName(userId: UserId): string {
  return USER_BASE[getPartnerUserId(userId)].name;
}
