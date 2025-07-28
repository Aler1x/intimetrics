export type ListPartner = {
  id: number;
  name: string;
  relationshipType: string | null;
  activityCount: number;
};

export type ActivityType =
  | 'sex'
  | 'cuddle'
  | 'oral'
  | 'anal'
  | 'vaginal'
  | 'masturbation'
  | 'other';
export type RelationshipType =
  | 'friend'
  | 'partner'
  | 'casual'
  | 'one-night-stand'
  | 'long-term'
  | 'other';
