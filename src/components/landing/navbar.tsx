"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons/github-icon";
import { AuthModal } from "@/components/auth/auth-modal";

import { useSession } from "next-auth/react";

export function Navbar() {
    const { data: session } = useSession();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
            // Hide navbar when user is deep in the hero/ghost UI area
            // Hero copy is min-h-screen, sticky container is 300vh
            setIsHidden(window.scrollY > 400 && window.scrollY < 3400); 
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <nav 
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b",
                    isHidden ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100",
                    isScrolled 
                        ? "bg-black/60 backdrop-blur-[12px] border-white/5 py-3" 
                        : "bg-transparent border-transparent py-5"
                )}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            <Clock className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">FocusOS</span>
                    </Link>

                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex items-center gap-6">
                            <Link href="/features" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Features</Link>
                            <Link href="/about" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Philosophy</Link>
                            <Link href="/docs" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Docs</Link>
                        </div>

                        <div className="flex items-center gap-4">
                            {session ? (
                                <Button 
                                    asChild
                                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-bold shadow-xl shadow-primary/10"
                                >
                                    <Link href="/timer">Go to Workspace</Link>
                                </Button>
                            ) : (
                                <a 
                                    href="https://github.com/Bhavikkpatel/FocusOS" 
                                    target="_blank"
                                    className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all font-bold"
                                >
                                    <GithubIcon className="h-5 w-5" variant="light" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
            />
        </>
    );
}
