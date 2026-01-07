"use client";

import { Provider } from "react-redux";
import { store } from "../redux/store";
import { ReactNode } from "react";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return <Provider store={store}>{children}</Provider>;
}
