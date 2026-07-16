"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { categoryColor } from "@/lib/categoryColors";

// Category-breakdown donut (top spending categories).
// Segment colors come from the shared categoryColor() map so they match the
// list swatches. Each segment is labelled with its % of the charted total.
export function DonutChart({ data }: { data: Array<{ category: string; total: number }> }) {
  if (data.length === 0) {
    return <div className="py-8 text-center text-sm text-gray-400">No spending yet</div>;
  }

  const renderPercent = ({ percent }: { percent?: number }) =>
    percent && percent > 0.04 ? `${Math.round(percent * 100)}%` : "";

  return (
    <ResponsiveContainer width="100%" height={230}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          label={renderPercent}
          labelLine={false}
        >
          {data.map((d) => (
            <Cell key={d.category} fill={categoryColor(d.category)} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => `${v.toLocaleString()} SAR`} />
      </PieChart>
    </ResponsiveContainer>
  );
}
