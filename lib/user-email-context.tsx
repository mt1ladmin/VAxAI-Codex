"use client";

import { createContext, useContext, type ReactNode } from "react";

const UserEmailContext = createContext<string | null>(null);

export function UserEmailProvider({
  email,
  children,
}: {
  email: string | null;
  children: ReactNode;
}) {
  return <UserEmailContext.Provider value={email}>{children}</UserEmailContext.Provider>;
}

export function useUserEmail(): string | null {
  return useContext(UserEmailContext);
}