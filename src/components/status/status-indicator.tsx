import { Badge } from '@/components/ui/badge';

type StatusTone = 'critical' | 'healthy' | 'planned' | 'warning';

const statusVariantMap: Record<StatusTone, 'amber' | 'outline' | 'teal'> = {
  planned: 'outline',
  healthy: 'teal',
  warning: 'amber',
  critical: 'amber',
};

export function StatusIndicator({
  label,
  tone,
}: {
  label: string;
  tone: StatusTone;
}) {
  return <Badge variant={statusVariantMap[tone]}>{label}</Badge>;
}

