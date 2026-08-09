import { Suspense } from "react";
import { RulesClientContainer } from "@/components/rules/rules-client-container";

export default function RulesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <RulesClientContainer />
    </Suspense>
  );
}
