import { View } from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';

import { colors } from '@/theme';

interface PriceChartProps {
  prices: number[];
  width?: number;
  height?: number;
  color?: string;
}

/**
 * Minimal line chart drawn with react-native-svg. Renders the supplied prices
 * as a normalized path from left to right. Shows a subtle min/max range band.
 */
export function PriceChart({
  prices,
  width = 320,
  height = 180,
  color = colors.primary[600],
}: PriceChartProps) {
  if (prices.length < 2) {
    return (
      <View
        style={{
          width,
          height,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    );
  }

  const padding = 12;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const dx = innerW / (prices.length - 1);

  const points = prices.map((p, i) => {
    const x = padding + i * dx;
    const y = padding + innerH - ((p - min) / range) * innerH;
    return { x, y, p };
  });

  const d = points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`)
    .join(' ');

  const areaPath = `${d} L ${points[points.length - 1].x.toFixed(2)} ${
    padding + innerH
  } L ${points[0].x.toFixed(2)} ${padding + innerH} Z`;

  const last = points[points.length - 1];
  const first = points[0];
  const isUp = last.p >= first.p;
  const strokeColor = isUp ? '#16a34a' : '#dc2626';
  const fillColor = isUp ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)';

  const gridY = [0.25, 0.5, 0.75].map(
    (t) => padding + innerH * t
  );

  return (
    <Svg width={width} height={height}>
      {gridY.map((y, i) => (
        <Line
          key={i}
          x1={padding}
          x2={width - padding}
          y1={y}
          y2={y}
          stroke={colors.gray[200]}
          strokeWidth={1}
          strokeDasharray="4 6"
        />
      ))}

      <Path d={areaPath} fill={fillColor} />
      <Path
        d={d}
        stroke={strokeColor}
        strokeWidth={2.5}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Circle
        cx={last.x}
        cy={last.y}
        r={5}
        fill={strokeColor}
        stroke="#fff"
        strokeWidth={2}
      />
    </Svg>
  );
}
