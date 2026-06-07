import { PageHeader } from '@/components/ui/PageHeader';
import { UserColorSettings } from '@/components/settings/UserColorSettings';
import { SupabaseSetup } from '@/components/settings/SupabaseSetup';
import { PushNotificationSettings } from '@/components/settings/PushNotificationSettings';

export function Settings() {
  return (
    <div className="space-y-6 pb-4">
      <PageHeader title="Einstellungen" subtitle="Sync, Benachrichtigungen & Profilfarben" />
      <SupabaseSetup />
      <PushNotificationSettings />
      <UserColorSettings />
    </div>
  );
}
