"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/navbar";
import { ConversionSection, Footer } from "@/components/landing/footer-section";
import { 
    Terminal, 
    Database, 
    Shield, 
    Globe, 
    Copy,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SETUP_STEPS = [
    {
        title: "1. Prerequisites",
        description: "Ensure your environment is ready for the Anti-Gravity engine.",
        items: [
            "Node.js v20 or higher",
            "NPM or PNPM"
        ],
        icon: Shield
    },
    {
        title: "2. Clone & Install",
        description: "Fetch the source and prepare the dependencies.",
        code: "git clone https://github.com/Bhavikkpatel/FocusOS.git\ncd FocusOS\nnpm install",
        icon: Terminal
    },
    {
        title: "3. Environment Configuration",
        description: "The core identity of your deployment lies here.",
        env: [
            "DATABASE_URL=\"postgres://...\"",
            "NEXTAUTH_SECRET=\"your-secret\"",
            "NEXTAUTH_URL=\"http://localhost:3000\""
        ],
        icon: Globe
    },
    {
        title: "4. Database Initialization",
        description: "Sync the schema with your PostgreSQL instance.",
        code: "npx prisma db push\nnpx prisma generate",
        icon: Database
    }
];

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20">
            <Navbar />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto space-y-20">
                    {/* Header */}
                    <div className="space-y-6 text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono tracking-widest uppercase text-slate-400"
                        >
                            <Terminal className="h-4 w-4" /> Setup Guide
                        </motion.div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight">
                            Self-Host <span className="text-primary italic">FocusOS</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
                            Transform your personal hardware or cloud instance into a Zero-Gravity execution sanctuary.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-12">
                        {SETUP_STEPS.map((step, index) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all"
                            >
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="flex-shrink-0">
                                        <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/50 transition-all">
                                            <step.icon className="h-8 w-8 text-white group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                    <div className="flex-grow space-y-4">
                                        <div>
                                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">{step.title}</h2>
                                            <p className="text-lg text-slate-500 font-medium mt-1">{step.description}</p>
                                        </div>

                                        {step.items && (
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                                                {step.items.map(item => (
                                                    <li key={item} className="flex items-center gap-3 text-slate-400 font-medium">
                                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {step.code && (
                                            <div className="relative group/code mt-4">
                                                <pre className="p-6 rounded-2xl bg-black border border-white/10 font-mono text-sm text-slate-300 overflow-x-auto">
                                                    <code>{step.code}</code>
                                                </pre>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="absolute top-4 right-4 opacity-0 group-hover/code:opacity-100 transition-opacity"
                                                    onClick={() => navigator.clipboard.writeText(step.code!)}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                        {step.env && (
                                            <div className="relative group/code mt-4">
                                                <pre className="p-6 rounded-2xl bg-black border border-white/10 font-mono text-sm text-primary/80 overflow-x-auto">
                                                    <code>{step.env.join('\n')}</code>
                                                </pre>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="absolute top-4 right-4 opacity-0 group-hover/code:opacity-100 transition-opacity"
                                                    onClick={() => navigator.clipboard.writeText(step.env!.join('\n'))}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </main>

            <ConversionSection />
            <Footer />
        </div>
    );
}
