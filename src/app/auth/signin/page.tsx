"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Mail, Lock, ArrowRight } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SignInPage() {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [isLoading, setIsLoading] = useState(false);
    const [config, setConfig] = useState({
        enableGoogleAuth: false,
        enableCredentialsAuth: true
    });
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });

    const isLogin = mode === "login";

    useEffect(() => {
        fetch("/api/config")
            .then(res => res.json())
            .then(data => {
                if (data.config) setConfig(data.config);
            })
            .catch(err => console.error("Failed to load auth config", err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isLogin) {
                const result = await signIn("credentials", {
                    identifier: formData.email || formData.username,
                    password: formData.password,
                    redirect: false,
                    callbackUrl: "/app"
                });

                if (result?.error) {
                    toast.error("Invalid credentials. Please try again.");
                } else {
                    toast.success("Welcome back!");
                    window.location.href = "/app";
                }
            } else {
                // Signup logic
                const response = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (!response.ok) {
                    toast.error(data.error || "Signup failed");
                } else {
                    toast.success("Account created! You can now log in.");
                    setMode("login");
                }
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0A0A0B] p-4">
            <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            
            <Card className="w-full max-w-md bg-[#111112] border-white/10 text-white shadow-2xl relative z-10">
                <CardHeader className="space-y-4 text-center items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/20">
                        <Clock className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-3xl font-bold tracking-tight">
                            {isLogin ? "FocusOS" : "Create Sanctuary"}
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-base">
                            {isLogin ? "Resume your sanctuary session" : "Start building your focus architecture"}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {config.enableCredentialsAuth && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-slate-500">Username</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input
                                            id="username"
                                            placeholder="architect"
                                            disabled={isLoading}
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="bg-white/5 border-white/10 pl-10 h-12 focus:ring-primary/20"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                    {isLogin ? "Email or Username" : "Email Address"}
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <Input
                                        id="email"
                                        placeholder="your@email.com"
                                        disabled={isLoading}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="bg-white/5 border-white/10 pl-10 h-12 focus:ring-primary/20"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="bg-white/5 border-white/10 pl-10 h-12 focus:ring-primary/20"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 mt-4 group"
                            >
                                {isLoading ? (
                                    <LoadingSpinner spinnerSize={20} />
                                ) : (
                                    <>
                                        {isLogin ? "Sign In" : "Get Started"}
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    )}

                    {config.enableGoogleAuth && (
                        <div className={`space-y-4 ${config.enableCredentialsAuth ? 'pt-6 border-t border-white/5' : ''}`}>
                            <Button
                                onClick={() => signIn("google", { callbackUrl: "/app" })}
                                variant="outline"
                                className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white h-12 font-bold rounded-xl transition-all"
                            >
                                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </Button>
                        </div>
                    )}

                    {config.enableCredentialsAuth && (
                        <div className="mt-8 pt-6 border-t border-white/5 text-center">
                            <p className="text-sm text-slate-400 font-medium italic">
                                {isLogin ? "New here?" : "Already joined?"}{" "}
                                <button 
                                    onClick={() => setMode(isLogin ? "signup" : "login")}
                                    className="text-primary hover:underline font-bold not-italic"
                                >
                                    {isLogin ? "Join the registry" : "Sign in now"}
                                </button>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
