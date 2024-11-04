import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Admin {
  id: string;
  name: string;
}

interface AdminContextType {
  currentAdmin: Admin | null;
  login: (adminName: string) => void;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_LIST: Admin[] = [
  { id: '1', name: 'Xiaoming' },
  { id: '2', name: 'Moumou' }
];

export function AdminProvider({ children }: { children: ReactNode }) {
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);

  const login = (adminName: string) => {
    const admin = ADMIN_LIST.find(a => a.name.toLowerCase() === adminName.toLowerCase());
    if (admin) {
      setCurrentAdmin(admin);
    }
  };

  const logout = () => {
    setCurrentAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ currentAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}