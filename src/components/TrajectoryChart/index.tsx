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

import type { BenchmarkProps, TrajectoryProps } from '../../types';
import styles from './TrajectoryChart.module.css';

interface TrajectoryChartProps {
  trajectory: Array<TrajectoryProps>;
  benchmarks: BenchmarkProps;
}

export default function TrajectoryChart({ trajectory, benchmarks }: TrajectoryChartProps) {
  if (!trajectory || trajectory.length === 0) return null;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Price Trajectory vs Economic Benchmarks</h3>
      
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trajectory} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="episode"
              tick={{ fontSize: 12, fill: '#64748b' }}
              label={{ 
                value: 'Episode', 
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
                value: 'Price (€)', 
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
                typeof value === 'number' ? `€${value.toFixed(2)}` : '',
                ''
              ]}
            />
            <Legend wrapperStyle={{ fontSize: '12px', bottom: '0px' }} />

            <Line
              type="monotone"
              dataKey="avg_price1"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Firm 1 Price"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="avg_price2"
              stroke="#10b981"
              strokeWidth={2}
              name="Firm 2 Price"
              dot={false}
            />

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
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}