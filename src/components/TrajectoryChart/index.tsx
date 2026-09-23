import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

import { RenderableText } from 'recharts';

import type { BenchmarkProps, TrajectoryProps } from '../../types';
import styles from './TrajectoryChart.module.css';

interface TrajectoryChartProps {
  trajectory: Array<TrajectoryProps>;
  benchmarks?: BenchmarkProps;
  title?: string;
  dataKey1: keyof TrajectoryProps;
  dataKey2: keyof TrajectoryProps;
  name1: string;
  name2: string;
  formatType?: string;
  xLabel: RenderableText;
  yLabel: RenderableText;
}

export function TrajectoryChart({ title = "Price Trajectory vs Economic Benchmarks", trajectory, benchmarks, 
    dataKey1, dataKey2, name1, name2, 
    formatType = "currency", xLabel, yLabel 
}: TrajectoryChartProps) {
  if (!trajectory || trajectory.length === 0) return null;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trajectory} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="episode"
              tick={{ fontSize: 12, fill: '#64748b' }}
              label={{ 
                value: xLabel,
                position: 'insideBottom', 
                offset: -12, 
                fill: '#475569', 
                fontSize: 12, 
                fontWeight: 500 
              }}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 12, fill: '#64748b' }}
              label={{ 
                value: yLabel, 
                angle: -90, 
                position: 'insideLeft', 
                offset: 0, 
                fill: '#475569', 
                fontSize: 12, 
                fontWeight: 500 
              }}
            />
            <Tooltip
              wrapperClassName={styles.tooltip}
              formatter={(value) => [
                (typeof value === 'number')
                  ? (formatType === 'currency' ? `€${value.toFixed(2)}` : value)
                  : '',
                ''
              ]}
            />
            <Legend wrapperStyle={{ fontSize: '12px', bottom: '0px' }} />

            <Line
              type="monotone"
              dataKey={dataKey1}
              stroke="#3b82f6"
              strokeWidth={2}
              name={name1}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey={dataKey2}
              stroke="#10b981"
              strokeWidth={2}
              name={name2}
              dot={false}
            />

            {benchmarks && (
              <>
                <ReferenceLine
                y={benchmarks.bertrand_price}
                label={{
                  value: 'Bertrand-Nash',
                  fill: '#f59e0b',
                  fontSize: 12,
                  position: 'top',
                  fontWeight: 600
                }}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                strokeWidth={1.5}
              />
              <ReferenceLine
                y={benchmarks.monopoly_price}
                label={{
                  value: 'Monopoly (Collusive)',
                  fill: '#ef4444',
                  fontSize: 12,
                  position: 'top',
                  fontWeight: 600
                }}
                stroke="#ef4444"
                strokeDasharray="5 5"
                strokeWidth={1.5}
              />
            </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}