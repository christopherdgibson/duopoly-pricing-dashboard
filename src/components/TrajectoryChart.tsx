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

import type { BenchmarkProps, TrajectoryProps } from '../types';

interface TrajectoryChartProps {
  trajectory: Array<TrajectoryProps>; 
  benchmarks: BenchmarkProps 
}

export default function TrajectoryChart({trajectory, benchmarks}: TrajectoryChartProps) {
  if (!trajectory || trajectory.length === 0) return null;

  return (
    <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
      <h3>Price Trajectory vs Economic Benchmarks</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trajectory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="episode" 
            tick={{ fontSize: 12 }} 
            style={{ fontSize: '12px' }}
            label={{ value: 'Episode', position: 'insideBottom', offset: -5, style: { fontSize: '12px' } }} 
          />
          <YAxis 
            domain={['auto', 'auto']} 
            tick={{ fontSize: 12 }} 
            style={{ fontSize: '12px' }}
            label={{ value: 'Price (€)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }} 
          />
          <Tooltip wrapperStyle={{ fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          
          <Line type="monotone" dataKey="avg_price1" stroke="#8884d8" name="Firm 1 Price" dot={false} />
          <Line type="monotone" dataKey="avg_price2" stroke="#82ca9d" name="Firm 2 Price" dot={false} />
          
          <ReferenceLine 
            y={benchmarks.bertrand_price} 
            label={{ value: 'Bertrand-Nash', fill: '#ff7300', fontSize: 12 }} 
            stroke="#ff7300" 
            strokeDasharray="5 5" 
          />
          <ReferenceLine 
            y={benchmarks.monopoly_price} 
            label={{ value: 'Monopoly (Collusive)', fill: '#e60000', fontSize: 12 }} 
            stroke="#e60000" 
            strokeDasharray="5 5" 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
