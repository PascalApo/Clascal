import { PageHeader } from '@/components/ui/PageHeader';
import { UserColorSettings } from '@/components/settings/UserColorSettings';
import { PushNotificationSettings } from '@/components/settings/PushNotificationSettings';

export function Settings() {
  return (
    <div className="space-y-6 pb-4">
      <PageHeader title="Einstellungen" subtitle="Farben & Benachrichtigungen" />
      <PushNotificationSettings />
      <UserColorSettings />
    </div>
  );
}
