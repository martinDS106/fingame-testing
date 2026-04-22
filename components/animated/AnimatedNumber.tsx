import { useEffect, useState } from 'react';
import { Text, type TextProps } from 'react-native';

interface AnimatedNumberProps extends TextProps {
  value: number;
  duration?: number;
  formatter?: (n: number) => string;
}

/**
 * Smoothly ticks a displayed number from previous value to the new one.
 * Uses JS timers (not UI thread) to avoid pulling in a heavier dep;
 * good enough for counter-style changes up to a few hundred ms.
 */
export function AnimatedNumber({
  value,
  duration = 450,
  formatter = (n) => Math.round(n).toString(),
  style,
  ...rest
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (display === value) return;
    const start = display;
    const diff = value - start;
    const startedAt = Date.now();
    let raf: ReturnType<typeof requestAnimationFrame>;

    const tick = () => {
      const elapsed = Date.now() - startedAt;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(start + diff * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <Text style={style} {...rest}>
      {formatter(display)}
    </Text>
  );
}
