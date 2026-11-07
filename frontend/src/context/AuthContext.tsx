import React, { createContext, useContext, useState } from 'react';
import { MOCK_USERS, ROLE_PERMISSIONS } from '../mock/users';
import { RolePermission, User, UserRole } from '../types/user';

interface AuthContextType {
  currentUser: User;
  currentRole: UserRole;
  permissions: RolePermission;
  switchRole: (role: UserRole) => void;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to ADMIN for demonstration exploration
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);

  const switchRole = (role: UserRole) => {
    const targetUser = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0];
    setCurrentUser(targetUser);
  };

  const permissions = ROLE_PERMISSIONS[currentUser.role];

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        permissions,
        switchRole,
        allUsers: MOCK_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
