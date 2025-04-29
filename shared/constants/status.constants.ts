export const TASK_STATUS = {
  IN_PROGRESS: 'in progress',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  CLOSED: 'closed',
} as const;

export const CHAT_PARTICIPANT_ROLE = {
  OWNER: 'owner',
  MEMBER: 'member',
} as const;

export const USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user',
} as const; 