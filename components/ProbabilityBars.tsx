"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface ProbabilityBarsProps {
  probabilities: {
    Low: number;
    Medium: number;
    High: number;
    Severe: number;
  };
}

const COLORS = {
  Low: "#238636",
  Medium: "#9E6A03",
  High: "#DA3633",
  Severe: "#8957E5",
};

export function ProbabilityBars({ probabilities }: ProbabilityBarsProps) {
  const data = [
    { label: "Low", value: probabilities.Low },
    { label: "Medium", value: probabilities.Medium },
    { label: "High", value: probabilities.High },
    { label: "Severe", value: probabilities.Severe },
  ];

  return (
    <div className="h-20">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fill: "#7D8590", fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis hide domain={[0, 100]} />
          <Bar dataKey="value" radius={3} barSize={8}>
            {data.map((entry) => (
              <Cell key={entry.label} fill={COLORS[entry.label as keyof typeof COLORS]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
