import { PageHeader } from '@/components/ui/PageHeader';
import { UserColorSettings } from '@/components/settings/UserColorSettings';
import { SupabaseSetup } from '@/components/settings/SupabaseSetup';

export function Settings() {
  return (
    <div className="space-y-6 pb-4">
      <PageHeader title="Einstellungen" subtitle="Sync & Profilfarben" />
      <SupabaseSetup />
      <UserColorSettings />
    </div>
  );
}
