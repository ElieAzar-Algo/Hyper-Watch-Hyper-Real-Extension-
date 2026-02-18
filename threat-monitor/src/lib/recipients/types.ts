export type RecipientRole =
  | 'Emergency Manager'
  | '911 Supervisor'
  | 'Dispatcher'
  | 'IT/Systems'
  | 'Communications/PIO';

export type RecipientCategory =
  | 'Public Safety'
  | '911 Center'
  | 'Municipality'
  | 'School'
  | 'Utility';

export interface Recipient {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: RecipientRole;
  category: RecipientCategory;
  isActive: boolean;
}

