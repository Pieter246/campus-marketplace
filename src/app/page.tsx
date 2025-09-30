// ./src/app/page.tsx
"use client";

import { Suspense } from "react";
import SearchClient from "./search-client";

export default function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return (
    <div className="max-w-screen-lg mx-auto px-2 pb-6">
      <div className="flex flex-col items-center text-center space-y-4 pb-6">
        <h1 className="text-2xl font-bold">Welcome to Campus Marketplace!</h1>
        <p>Buy and sell textbooks, technology, and more.</p>
      </div>

      <Suspense fallback={<div className="space-y-4 bg-white rounded-xl p-4">Loading search...</div>}>
        <SearchClient searchParams={searchParams} />
      </Suspense>
    </div>
  );
}