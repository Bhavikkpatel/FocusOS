"use client";

import { Card } from "@/components/ui/card";
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip,
    Legend
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

interface ProjectDistributionChartProps {
    data: {
        name: string;
        value: number;
        color: string;
    }[];
}

export function ProjectDistributionChart({ data }: ProjectDistributionChartProps) {
    const totalMinutes = data.reduce((acc, curr) => acc + curr.value, 0);
    const hasData = totalMinutes > 0;

    return (
        <Card className="p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800/50 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-500/10 p-2 rounded-xl text-purple-500">
                    <PieChartIcon className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-bold text-lg tracking-tight">Time Distribution</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">By Project (%)</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center min-h-[300px]">
                {hasData ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="45%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    borderRadius: '16px', 
                                    border: 'none', 
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    padding: '12px'
                                }}
                                formatter={(value: number) => [`${Math.round((value / totalMinutes) * 100)}%`, 'Effort']}
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground opacity-50 px-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border-2 border-dashed">
                        <PieChartIcon className="h-12 w-12 mb-2" />
                        <p className="font-bold text-sm tracking-tight uppercase">No deep work sessions recorded yet</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
