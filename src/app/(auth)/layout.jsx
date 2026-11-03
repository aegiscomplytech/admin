export default function AuthLayout({ children }) {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
