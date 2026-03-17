"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { type ShapDriver } from "@/lib/types";

interface ShapChartProps {
  data: ShapDriver[];
}

function colorFromValue(value: number) {
  if (value >= 0.75) return "#F85149";
  if (value >= 0.45) return "#E3B341";
  return "#58A6FF";
}

export function ShapChart({ data }: ShapChartProps) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <p className="section-label">SHAP - Top Congestion Drivers</p>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="feature"
              tick={{ fill: "#7D8590", fontSize: 11 }}
              width={96}
              axisLine={false}
              tickLine={false}
            />
            <Bar dataKey="value" radius={3} barSize={6} background={{ fill: "var(--shap-track)" }}>
              {data.map((item) => (
                <Cell key={item.feature} fill={colorFromValue(item.value)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 space-y-1">
        {data.map((item) => (
          <div key={item.feature} className="flex items-center justify-between text-[12.5px] font-normal text-muted">
            <span>{item.feature}</span>
            <span style={{ color: colorFromValue(item.value) }}>{item.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
