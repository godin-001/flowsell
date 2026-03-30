"use client";

import { Suspense } from "react";
import { ConfirmContent } from "./content";

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
          <div className="text-zinc-500">Cargando...</div>
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
