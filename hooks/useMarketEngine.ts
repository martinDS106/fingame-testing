import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useInvestmentStore } from '@/stores';
import { pullStockPrices } from '@/lib/syncServiceApi';

/**
 * useMarketEngine — mounts a ticking interval that advances stock prices
 * every `intervalMs`. Pauses while the app is in background to save battery.
 *
 * Mount once at a high level (e.g. dashboard or investment screen). It's safe
 * to mount multiple times — only the most recent interval stays active.
 */
export function useMarketEngine(intervalMs = 6000) {
  const tick = useInvestmentStore((s) => s.tickMarket);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    let overridesTimer: ReturnType<typeof setInterval> | null = null;
    let polling = false;

    function start() {
      if (timer) return;
      timer = setInterval(tick, intervalMs);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      if (overridesTimer) {
        clearInterval(overridesTimer);
        overridesTimer = null;
      }
    }

    async function pollOverrides() {
      if (polling) return;
      polling = true;
      try {
        const rows = await pullStockPrices();
        if (!rows.length) return;
        const map: Record<string, number> = {};
        for (const r of rows) {
          if (!r.symbol) continue;
          if (typeof r.price !== 'number') continue;
          map[r.symbol.trim().toUpperCase()] = r.price;
        }
        if (Object.keys(map).length) {
          useInvestmentStore.getState().updatePrices(map);
        }
      } finally {
        polling = false;
      }
    }

    start();
    // Poll admin overrides every ~15s while active.
    overridesTimer = setInterval(() => {
      void pollOverrides();
    }, 15000);
    void pollOverrides();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        start();
        if (!overridesTimer) {
          overridesTimer = setInterval(() => {
            void pollOverrides();
          }, 15000);
          void pollOverrides();
        }
      } else {
        stop();
      }
    });

    return () => {
      stop();
      sub.remove();
    };
  }, [tick, intervalMs]);
}
