export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-full flex-1">
      {/* Sidebar goes here (src/components/sidebar) */}
      <div className="flex flex-1 flex-col">
        {/* Header goes here (src/components/header) */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
