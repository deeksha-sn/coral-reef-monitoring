export type UserRole = 'ADMIN' | 'RESEARCHER' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  affiliation?: string;
  avatarUrl?: string;
}

export interface RolePermission {
  role: UserRole;
  canManageUsers: boolean;
  canCreateSites: boolean;
  canDeleteSites: boolean;
  canUploadAssessments: boolean;
  canDeleteAssessments: boolean;
  canRunPredictions: boolean;
  canGenerateReports: boolean;
  canManageSettings: boolean;
  canAcknowledgeAlerts: boolean;
  description: string;
}
