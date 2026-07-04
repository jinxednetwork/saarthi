import { ActionComposer } from "@/components/action-composer/ActionComposer";
import { ClusterDrawer } from "@/components/cluster/ClusterDrawer";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";
import { WelcomeSplash } from "@/components/splash/WelcomeSplash";

/**
 * App shell: collapsible glass sidebar + floating glass top strip. Pages fill
 * the remaining area; the dashboard renders a full-bleed map stage, other
 * pages scroll internally (h-full overflow-y-auto on their root).
 */
export default function DashboardShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <WelcomeSplash />
      <Sidebar />
      <div className="relative min-w-0 flex-1">
        <TopBar />
        <main className="h-full">{children}</main>
      </div>
      <ClusterDrawer />
      <ActionComposer />
    </div>
  );
}
