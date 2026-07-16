"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Financial-score trend over time (snapshots).
export function TrendChart({ data }: { data: Array<{ label: string; value: number }> }) {
  if (data.length === 0) {
    return <div className="py-8 text-center text-sm text-gray-400">No history yet</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e9f1" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#1A2B4D"
          strokeWidth={3}
          dot={{ r: 4, fill: "#D4AF37", stroke: "#1A2B4D" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
