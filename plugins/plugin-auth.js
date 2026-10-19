import crypto from 'node:crypto';

/**
 * NextAuth (v4) + App Router 範本
 * 對應 create-next-app 產生的結構：src/app、import alias @/*
 */

const AUTH_OPTIONS = `import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // TODO: 改成查詢你的資料庫或 API。以下是示範帳號，請勿用於正式環境。
        if (credentials?.email === 'admin@example.com' && credentials?.password === 'admin123') {
          return { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { role?: string }).role = token.role as string | undefined;
      return session;
    },
  },
};
`;

const ROUTE = `import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
`;

const LOGIN_PAGE = `'use client';

import { useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', { email, password, redirect: false });

    setLoading(false);
    if (result?.error) {
      setError('登入失敗，請確認帳號密碼');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 360, margin: '96px auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>登入</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>示範帳號：admin@example.com / admin123</p>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
        <input type="password" required placeholder="密碼" value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
        {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}
        <button type="submit" disabled={loading}
          style={{ padding: '10px 12px', borderRadius: 8, background: '#111827', color: '#fff', opacity: loading ? 0.6 : 1 }}>
          {loading ? '登入中…' : '登入'}
        </button>
      </form>
    </main>
  );
}
`;

const SIGN_OUT_BUTTON = `'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: '/login' })}
      style={{ padding: '8px 14px', borderRadius: 8, background: '#dc2626', color: '#fff' }}>
      登出
    </button>
  );
}
`;

const DASHBOARD_PAGE = `import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import SignOutButton from '@/components/auth/SignOutButton';

// 讀取 session 會用到 cookies，放在 Suspense 裡面，
// 新版 Next.js 預設開啟 cacheComponents 時才能正常 build
async function UserBar() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <span style={{ color: '#4b5563' }}>歡迎，{session.user?.name}</span>
      <SignOutButton />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <main style={{ maxWidth: 960, margin: '48px auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>管理後台</h1>
        <Suspense fallback={<span style={{ color: '#9ca3af' }}>載入中…</span>}>
          <UserBar />
        </Suspense>
      </header>
      <p style={{ color: '#6b7280' }}>從這裡開始建立你的後台功能。</p>
    </main>
  );
}
`;

const ADMIN_HOME = `import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
`;

export default {
  name: 'plugin-auth',
  priority: 50,

  hooks: {
    async afterCreate(ctx) {
      if (!ctx.config.features?.auth) return;

      await ctx.utils.install(['next-auth@4']);

      const { safeInject } = ctx.utils;
      safeInject({ targetPath: 'src/lib/auth.ts', content: AUTH_OPTIONS });
      safeInject({ targetPath: 'src/app/api/auth/[...nextauth]/route.ts', content: ROUTE });
      safeInject({ targetPath: 'src/app/login/page.tsx', content: LOGIN_PAGE });
      safeInject({ targetPath: 'src/components/auth/SignOutButton.tsx', content: SIGN_OUT_BUTTON });
      safeInject({ targetPath: 'src/app/dashboard/page.tsx', content: DASHBOARD_PAGE });

      // 每個專案產生一組自己的 secret
      safeInject({
        targetPath: '.env.local',
        content: `NEXTAUTH_URL=http://localhost:3000\nNEXTAUTH_SECRET=${crypto.randomBytes(32).toString('base64')}\n`,
      });

      // 後台模板：首頁直接導向 dashboard（取代 create-next-app 的預設首頁）
      if (ctx.config.template === 'admin') {
        safeInject({ targetPath: 'src/app/page.tsx', content: ADMIN_HOME, force: true });
      }

      ctx.state.set('notes', [
        ...(ctx.state.get('notes') || []),
        'Auth：示範帳號 admin@example.com / admin123，正式使用前請修改 src/lib/auth.ts 的 authorize()。',
      ]);
    }
  }
};
