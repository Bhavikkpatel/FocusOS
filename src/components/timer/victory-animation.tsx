import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const COLORS = ["#22c55e", "#3b82f6", "#a855f7", "#eab308", "#ef4444"];

export function VictoryAnimation() {
    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        const newParticles = Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: Math.random() * 12 + 8,
            rotation: Math.random() * 360,
            delay: Math.random() * 0.5,
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[200] flex items-center justify-center overflow-hidden">
            <AnimatePresence>
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ 
                            opacity: 0, 
                            scale: 0,
                            x: 0,
                            y: 0,
                            rotate: 0 
                        }}
                        animate={{ 
                            opacity: [0, 1, 1, 0], 
                            scale: [0, 1.2, 1, 0.5],
                            x: `${p.x}vw`,
                            y: `${p.y}vh`,
                            rotate: p.rotation + 720
                        }}
                        transition={{ 
                            duration: 2.5, 
                            delay: p.delay,
                            ease: "easeOut"
                        }}
                        className="absolute rounded-full"
                        style={{ 
                            width: p.size, 
                            height: p.size, 
                            backgroundColor: p.color,
                            boxShadow: `0 0 20px ${p.color}80` 
                        }}
                    />
                ))}
            </AnimatePresence>
            
            <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "backOut" }}
                className="bg-white dark:bg-slate-900 px-8 py-4 rounded-3xl border-4 border-green-500 shadow-2xl flex flex-col items-center gap-2"
            >
                <motion.span 
                    animate={{ rotate: [0, 10, -10, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-6xl"
                >
                    🏆
                </motion.span>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Goal Achieved!</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Deep work completion</p>
            </motion.div>
        </div>
    );
}
