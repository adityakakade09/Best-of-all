'use client';

import { SearchTrendPoint } from '@bestofall/shared';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function SearchTrendChart({ data }: { data: SearchTrendPoint[] }) {
  return (
    <div className="glass-panel rounded-xl3 p-5">
      <h3 className="mb-4 font-display text-sm font-semibold">Search volume — last 14 days</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,130,160,0.15)" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.9)' }}
          />
          <Line type="monotone" dataKey="searches" stroke="#4F6BFF" strokeWidth={2.5} dot={false} name="Searches" />
          <Line type="monotone" dataKey="uniqueUsers" stroke="#17E3C2" strokeWidth={2.5} dot={false} name="Unique users" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
