import { useState, useMemo } from "react";
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
import { BarChart3, ChevronLeft } from "lucide-react";

interface WeeklyFocusChartProps {
    data: {
        name: string;
        minutes: number;
    }[];
}

export function WeeklyFocusChart({ data }: WeeklyFocusChartProps) {
    const [drilledDay, setDrilledDay] = useState<string | null>(null);

    // Mock data for the zoomed-in daily view (24 hours)
    const dailyData = useMemo(() => {
        if (!drilledDay) return [];
        // Generate mock house-by-hour distribution based on total minutes
        const totalMinutes = data.find(d => d.name === drilledDay)?.minutes || 0;
        return Array.from({ length: 24 }, (_, i) => ({
            hour: `${i}:00`,
            minutes: i >= 9 && i <= 18 ? Math.round((totalMinutes / 10) * (0.8 + Math.random() * 0.4)) : Math.round(Math.random() * 5)
        }));
    }, [drilledDay, data]);

    if (drilledDay) {
        return (
            <Card className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setDrilledDay(null)}
                            className="bg-slate-100 dark:bg-white/5 p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-all group"
                        >
                            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div>
                            <h3 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">{drilledDay} Detail</h3>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">Hourly Distribution</p>
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                            <XAxis 
                                dataKey="hour" 
                                axisLine={false} 
                                tickLine={false} 
                                interval={3}
                                tick={{ fontSize: 10, fontWeight: 600, fill: "currentColor" }}
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
                                cursor={false}
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
                                radius={[4, 4, 4, 4]} 
                                barSize={12}
                                fill="#3b82f6"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-xl text-primary shrink-0">
                        <BarChart3 className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Weekly Focus Trend</h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">Activity History</p>
                    </div>
                </div>
                {/* Last 7 Days indicator */}
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg uppercase tracking-widest">
                    Last 7 Days
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                        data={data} 
                        margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                        onDoubleClick={(data) => {
                            if (data && data.activePayload && data.activePayload.length > 0) {
                                setDrilledDay(data.activePayload[0].payload.name);
                            }
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fontWeight: 600, fill: "currentColor" }}
                            className="text-muted-foreground font-bold"
                            dy={10}
                            style={{ cursor: 'pointer' }}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 11, fontWeight: 600, fill: "currentColor" }}
                            className="text-muted-foreground opacity-50"
                        />
                        <Tooltip 
                            cursor={false}
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
                            style={{ cursor: 'pointer' }}
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
