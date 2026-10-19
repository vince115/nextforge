const STORE = `import { configureStore } from '@reduxjs/toolkit';

export const makeStore = () =>
  configureStore({
    reducer: {},
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
`;

const HOOKS = `import { useDispatch, useSelector, useStore } from 'react-redux';
import type { AppDispatch, AppStore, RootState } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
`;

const PROVIDER = `'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from './store';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
}
`;

export default {
  name: 'plugin-redux',
  priority: 50,

  hooks: {
    async afterCreate(ctx) {
      if (!ctx.config.features?.redux) return;

      await ctx.utils.install(['@reduxjs/toolkit', 'react-redux']);

      ctx.utils.safeInject({ targetPath: 'src/lib/redux/store.ts', content: STORE });
      ctx.utils.safeInject({ targetPath: 'src/lib/redux/hooks.ts', content: HOOKS });
      ctx.utils.safeInject({ targetPath: 'src/lib/redux/StoreProvider.tsx', content: PROVIDER });

      ctx.state.set('notes', [
        ...(ctx.state.get('notes') || []),
        'Redux：用 src/lib/redux/StoreProvider.tsx 包住 src/app/layout.tsx 的 children 即可使用。',
      ]);
    }
  }
};
