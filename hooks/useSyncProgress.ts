import { useCallback } from 'react';

import { upsertProgress, type RemoteProgress } from '@/lib/syncServiceApi';
import { useUserStore } from '@/stores';

type Kind = RemoteProgress['kind'];

/**
 * useSyncProgress — tiny helper so screens can report progress to Supabase
 * without reaching into the sync service directly. No-op when signed out.
 *
 * Example:
 *   const reportProgress = useSyncProgress();
 *   reportProgress('simulation', 'business', 50);
 *   reportProgress('quiz', 'stock-basics', 100, true);
 */
export function useSyncProgress() {
  const remoteUserId = useUserStore((s) => s.remoteUserId);

  return useCallback(
    (kind: Kind, refId: string, progress: number, completed = false) => {
      if (!remoteUserId) return;
      upsertProgress(remoteUserId, kind, refId, progress, completed).catch(
        () => undefined
      );
    },
    [remoteUserId]
  );
}
