import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col bg-chalk lg:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-4 pb-10 pt-6 sm:px-8 sm:pb-8 sm:pt-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
