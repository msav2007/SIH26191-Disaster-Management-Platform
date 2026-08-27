import { getCommandCenterData } from '@/server/command-center/command-center-service';
import { CommandCenterWorkspace } from '@/features/command-center/components/command-center-workspace';

export default async function DashboardPage() {
  const data = await getCommandCenterData();

  return <CommandCenterWorkspace data={data} />;
}
