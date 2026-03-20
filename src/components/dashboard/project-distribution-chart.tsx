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
        <Card className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-500/10 p-2 rounded-xl text-purple-500 shrink-0">
                    <PieChartIcon className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Time Distribution</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">By Project (%)</p>
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
                                paddingAngle={data.length > 1 ? 8 : 0}
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
