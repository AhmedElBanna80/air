import { Suspense } from "react";

import { UploadForm } from "@/components/upload-form";

export default function SettingsPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Upload Air Quality Data</h2>
        <Suspense fallback={<div>Loading form...</div>}>
          <UploadForm />
        </Suspense>
      </div>
    </div>
  );
}
