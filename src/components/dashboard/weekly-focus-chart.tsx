"use client";

import { Card } from "@/components/ui/card";
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell
} from "recharts";
import { BarChart3 } from "lucide-react";

interface WeeklyFocusChartProps {
    data: {
        name: string;
        minutes: number;
    }[];
}

export function WeeklyFocusChart({ data }: WeeklyFocusChartProps) {
    return (
        <Card className="p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800/50 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-xl text-primary">
                        <BarChart3 className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg tracking-tight">Weekly Focus Trend</h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Minutes spent per day</p>
                    </div>
                </div>
                <div className="text-[10px] font-bold text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg uppercase tracking-widest">
                    Last 7 Days
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fontWeight: 600, fill: "currentColor" }}
                            className="text-muted-foreground font-bold"
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 11, fontWeight: 600, fill: "currentColor" }}
                            className="text-muted-foreground opacity-50"
                        />
                        <Tooltip 
                            cursor={{ fill: 'currentColor', opacity: 0.05 }}
                            contentStyle={{ 
                                borderRadius: '16px', 
                                border: 'none', 
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                padding: '12px'
                            }}
                            labelStyle={{ fontWeight: 800, marginBottom: '4px' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 600, color: '#3b82f6' }}
                            formatter={(value: number) => [`${value} min`, 'Focus Time']}
                        />
                        <Bar 
                            dataKey="minutes" 
                            radius={[8, 8, 8, 8]} 
                            barSize={32}
                        >
                            {data.map((_, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={index === data.length - 1 ? '#3b82f6' : 'rgba(59, 130, 246, 0.4)'} 
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
