"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type AuthModalType = "login" | "register" | null;

interface AuthModalContextType {
  isOpen: boolean;
  type: AuthModalType;
  openModal: (type?: AuthModalType) => void;
  closeModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [type, setType] = useState<AuthModalType>(null);
  
  const openModal = (newType: AuthModalType = "login") => {
    setType(newType);
  };
  
  const closeModal = () => {
    setType(null);
  };

  return (
    <AuthModalContext.Provider value={{ isOpen: type !== null, type, openModal, closeModal }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) throw new Error("useAuthModal must be used within AuthModalProvider");
  return context;
}
