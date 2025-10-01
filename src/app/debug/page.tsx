"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth";

export default function DebugPage() {
  const [debugResult, setDebugResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  const runDebug = async (endpoint: string, method = "GET", body?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const user = auth?.currentUser;
      const token = user ? await user.getIdToken() : null;

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...(body && { body: JSON.stringify(body) }),
      });

      const result = await response.json();
      setDebugResult(result);
    } catch (error) {
      setDebugResult({ error: String(error) });
    }
    setLoading(false);
  };

  const fixPayment = async () => {
    await runDebug("/api/debug/fix-payment", "POST", { action: "fix-payment" });
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Debug Payment Issues</h1>
      
      <div className="space-y-4">
        <button
          onClick={() => runDebug("/api/debug/purchases")}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
          disabled={loading}
        >
          Check Purchases
        </button>

        <button
          onClick={() => runDebug("/api/debug/item")}
          className="bg-green-500 text-white px-4 py-2 rounded mr-4"
          disabled={loading}
        >
          Check Sample Item
        </button>

        <button
          onClick={fixPayment}
          className="bg-red-500 text-white px-4 py-2 rounded mr-4"
          disabled={loading}
        >
          Fix Payment Issue
        </button>
      </div>

      {loading && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          Loading...
        </div>
      )}

      {debugResult && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-bold mb-4">Debug Result:</h2>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(debugResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}