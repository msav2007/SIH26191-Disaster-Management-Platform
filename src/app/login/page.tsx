import { LoginPanel } from '@/features/auth/components/login-panel';

export default function LoginPage() {
  return (
    <main className="surface-grid min-h-screen px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <LoginPanel />
      </div>
    </main>
  );
}

