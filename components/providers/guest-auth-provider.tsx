"use client";

import React, { createContext, useContext, useState } from "react";
import { GuestAuthModal, GuestAuthModalProps } from "@/components/shared/guest-auth-modal";

interface GuestAuthOptions {
  title?: string;
  description?: string;
  icon?: "heart" | "plus" | "user" | "bookmark" | "lock";
}

interface GuestAuthContextType {
  isOpen: boolean;
  options: GuestAuthOptions;
  openGuestAuthModal: (options?: GuestAuthOptions) => void;
  closeGuestAuthModal: () => void;
}

const GuestAuthContext = createContext<GuestAuthContextType | undefined>(undefined);

export function GuestAuthProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<GuestAuthOptions>({});

  const openGuestAuthModal = (opts?: GuestAuthOptions) => {
    if (opts) setOptions(opts);
    setIsOpen(true);
  };

  const closeGuestAuthModal = () => {
    setIsOpen(false);
  };

  return (
    <GuestAuthContext.Provider
      value={{ isOpen, options, openGuestAuthModal, closeGuestAuthModal }}
    >
      {children}
      <GuestAuthModal
        isOpen={isOpen}
        onClose={closeGuestAuthModal}
        title={options.title}
        description={options.description}
        icon={options.icon}
      />
    </GuestAuthContext.Provider>
  );
}

export function useGuestAuthModal() {
  const context = useContext(GuestAuthContext);
  if (!context) {
    throw new Error("useGuestAuthModal must be used within a GuestAuthProvider");
  }
  return context;
}
