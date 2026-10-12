import { dashboardTrail } from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

export default function DashboardCrumbs() {
  return <PageHeaderTrail items={dashboardTrail()} />;
}
