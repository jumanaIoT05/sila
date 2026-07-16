"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Budget vs actual, or this-month vs last-month comparison.
export function BarCompare({
  data,
}: {
  data: Array<{ name: string; a: number; b: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e9f1" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => `${v.toLocaleString()} SAR`} />
        <Bar dataKey="a" fill="#1A2B4D" radius={[4, 4, 0, 0]} />
        <Bar dataKey="b" fill="#D4AF37" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
