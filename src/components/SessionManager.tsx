"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth";

function setCookie(name: string, value: string, days: number) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export default function SessionManager() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      setCookie("authSession", "true", 1); // Set a cookie to indicate session is checked
    }
  }, [isLoading]);

  return null; // This component does not render anything
}