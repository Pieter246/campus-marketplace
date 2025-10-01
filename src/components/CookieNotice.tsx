"use client";

import { useState, useEffect } from "react";

export default function CookieNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the notice
    const hasSeenNotice = localStorage.getItem('campusMarketplaceCookieNotice');
    if (!hasSeenNotice) {
      // Small delay to let the page load first
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('campusMarketplaceCookieNotice', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-4 md:right-auto md:max-w-md bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 animate-in fade-in duration-300">
      <div className="flex flex-col space-y-3">
        <p className="text-sm text-gray-700">
          We use necessary cookies to make our site work, such as keeping you logged in. 
          By using our site, you agree to our use of these cookies as described in our{' '}
          <a href="/privacy" className="text-blue-600 hover:underline font-medium">
            Privacy Policy
          </a>.
        </p>
        <div className="flex justify-end">
          <button
            onClick={handleAccept}
            className="cursor-pointer px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}