"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    Shield, 
    Key, 
    CheckCircle2, 
    AlertCircle, 
    Copy, 
    Save, 
    Loader2,
    Settings,
    Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminSetupPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [config, setConfig] = useState({
        enableGoogleAuth: false,
        enableCredentialsAuth: true
    });
    const [envStatus, setEnvStatus] = useState({
        hasGoogleSecret: false,
        hasNextAuthSecret: false,
        hasNextAuthUrl: false,
        isSelfHosted: false
    });

    useEffect(() => {
        const loadConfig = async () => {
            try {
                console.log("Fetching config...");
                const res = await fetch("/api/config");
                const data = await res.json();
                console.log("Config loaded:", data);
                if (data.config) setConfig(data.config);
                if (data.envStatus) setEnvStatus(data.envStatus);
            } catch (err) {
                console.error("Config fetch error:", err);
                toast.error("Failed to load configuration");
            } finally {
                setIsLoading(false);
            }
        };
        loadConfig();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            });

            if (res.ok) {
                toast.success("Settings saved successfully");
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to save settings");
            }
        } catch (error) {
            toast.error("An error occurred while saving");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center gap-4 text-white">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-xs font-mono text-primary/50 uppercase tracking-[0.2em]">Initializing System Admin...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white p-8">
            <div className="max-w-4xl mx-auto space-y-12">
                <header className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                            <Settings className="h-3 w-3" /> System Administration
                        </div>
                        {envStatus.isSelfHosted && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-500 uppercase tracking-widest">
                                <Shield className="h-3 w-3" /> Self-Hosted Mode (Bypass Active)
                            </div>
                        )}
                    </div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        Self-Host <span className="text-primary">Setup</span>
                    </h1>
                    <p className="text-slate-400 font-medium">
                        Configure your authentication architecture and environment security.
                    </p>
                </header>

                {envStatus.isSelfHosted && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4"
                    >
                        <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white">Frictionless Access Enabled</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                You are accessing this page in self-hosted mode. Authentication is bypassed to allow initial system setup. 
                                In production cloud deployments, this page is restricted to authorized administrators.
                            </p>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Auth Methods */}
                    <Card className="bg-[#111112] border-white/5 shadow-2xl overflow-hidden">
                        <CardHeader className="border-b border-white/5 p-6">
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-primary" /> Auth Methods
                            </CardTitle>
                            <CardDescription className="text-slate-500">Enable or disable entry points</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="space-y-1">
                                    <h4 className="font-bold">Credentials (Email/Pass)</h4>
                                    <p className="text-xs text-slate-500">Default self-hosted method</p>
                                </div>
                                <Switch 
                                    checked={config.enableCredentialsAuth} 
                                    onCheckedChange={(val) => setConfig({ ...config, enableCredentialsAuth: val })}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="space-y-1">
                                    <h4 className="font-bold">Google OAuth</h4>
                                    <p className="text-xs text-slate-500">Requires Google Cloud secrets</p>
                                </div>
                                <Switch 
                                    checked={config.enableGoogleAuth} 
                                    onCheckedChange={(val) => setConfig({ ...config, enableGoogleAuth: val })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="bg-white/5 p-4 flex justify-end px-6 py-4">
                            <Button 
                                onClick={handleSave} 
                                disabled={isSaving}
                                className="bg-primary text-white font-bold h-11 px-8 rounded-xl"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                Save Config
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Environment Status */}
                    <Card className="bg-[#111112] border-white/5 shadow-2xl">
                        <CardHeader className="border-b border-white/5 p-6">
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" /> Security Status
                            </CardTitle>
                            <CardDescription className="text-slate-500">Live environment checks</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-400 uppercase tracking-widest text-[10px]">NEXTAUTH_SECRET</span>
                                {envStatus.hasNextAuthSecret ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-400 uppercase tracking-widest text-[10px]">GOOGLE_CLIENT_ID</span>
                                {envStatus.hasGoogleSecret ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-400 uppercase tracking-widest text-[10px]">NEXTAUTH_URL</span>
                                {envStatus.hasNextAuthUrl ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* .env Helper */}
                {config.enableGoogleAuth && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3">
                            <Layout className="h-5 w-5 text-primary" />
                            <h2 className="text-2xl font-bold tracking-tight">Google OAuth Setup</h2>
                        </div>
                        <p className="text-slate-400 text-sm">
                            To enable Google login, ensure the following variables are set in your <code className="text-primary">.env</code> file.
                        </p>
                        <div className="relative group/code">
                            <pre className="p-6 rounded-2xl bg-black border border-white/5 font-mono text-sm text-primary/80 overflow-x-auto">
                                <code>{`GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${Math.random().toString(36).substring(2, 15)}"`}</code>
                            </pre>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-4 right-4 opacity-0 group-hover/code:opacity-100 transition-opacity"
                                onClick={() => {
                                    navigator.clipboard.writeText(`GOOGLE_CLIENT_ID="..."\nGOOGLE_CLIENT_SECRET="..."`);
                                    toast.success("Template copied to clipboard");
                                }}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
