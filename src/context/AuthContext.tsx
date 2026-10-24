import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../types';

export const USER_PROFILES: Record<UserRole, UserProfile> = {
  ADMIN: {
    id: 'usr-admin',
    name: 'Mehdi Benali',
    email: 'admin.depa@portwatt.local',
    role: 'ADMIN',
    roleLabel: 'Administrateur Technique',
    description: 'Accès total : configuration équipements, cartographie Modbus, seuils, utilisateurs et maintenance.',
    permissions: {
      canConfigureEquipment: true,
      canAcknowledgeAlerts: true,
      canEditEnPIAndSER: true,
      canRunRecette: true,
      canManageUsers: true,
      canExportReports: true,
    },
  },
  ENERGY_MANAGER: {
    id: 'usr-energy',
    name: 'Youssef El Mansouri',
    email: 'energie@marsamaroc.co.ma',
    role: 'ENERGY_MANAGER',
    roleLabel: 'Responsable Énergie (ISO 50001)',
    description: 'Pilotage ISO 50001 : SER, IPE, analyses de régression, bilans énergétiques et exports réglementaires.',
    permissions: {
      canConfigureEquipment: false,
      canAcknowledgeAlerts: true,
      canEditEnPIAndSER: true,
      canRunRecette: true,
      canManageUsers: false,
      canExportReports: true,
    },
  },
  OPERATOR: {
    id: 'usr-operator',
    name: 'Karim Tazi',
    email: 'exploitation@portagadir.ma',
    role: 'OPERATOR',
    roleLabel: 'Exploitant Portuaire',
    description: 'Surveillance opérationnelle : synoptiques unifilaires, temps réel et prise en charge des alertes.',
    permissions: {
      canConfigureEquipment: false,
      canAcknowledgeAlerts: true,
      canEditEnPIAndSER: false,
      canRunRecette: false,
      canManageUsers: false,
      canExportReports: true,
    },
  },
  VIEWER: {
    id: 'usr-viewer',
    name: 'Auditeur Externe',
    email: 'auditeur@afnor.org',
    role: 'VIEWER',
    roleLabel: 'Lecteur / Auditeur',
    description: 'Consultation seule : tableaux de bord, graphiques, synthèses et vérification des hypothèses.',
    permissions: {
      canConfigureEquipment: false,
      canAcknowledgeAlerts: false,
      canEditEnPIAndSER: false,
      canRunRecette: false,
      canManageUsers: false,
      canExportReports: true,
    },
  },
};

interface AuthContextType {
  currentUser: UserProfile;
  setRole: (role: UserRole) => void;
  availableRoles: UserProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('portwatt_active_role');
    return (saved as UserRole) || 'ADMIN';
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('portwatt_active_role', newRole);
  };

  const currentUser = USER_PROFILES[role];
  const availableRoles = Object.values(USER_PROFILES);

  return (
    <AuthContext.Provider value={{ currentUser, setRole, availableRoles }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
