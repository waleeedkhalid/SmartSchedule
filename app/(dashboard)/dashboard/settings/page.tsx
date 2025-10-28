import { TimeGridConfigForm } from "@/components/time-grid-config-form";
import { getTimeGridConfig } from "@/lib/db/config";

export default async function SettingsPage() {
  const config = await getTimeGridConfig();

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Configure the time grid and scheduling parameters
        </p>

        <TimeGridConfigForm initialConfig={config} />
      </div>
    </div>
  );
}

