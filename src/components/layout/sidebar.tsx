"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    CheckCircle,
    FolderOpen,
    BarChart2,
    CalendarDays,
    Settings,
    ChevronUp,
    LogOut,
    X,
    LayoutDashboard,
    ChevronLeft,
    Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSidebarStore } from "@/store/sidebar";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
    { name: "Dashboard", href: "/app", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FolderOpen },
    { name: "Calendar", href: "/calendar", icon: CalendarDays },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
    { name: "Settings", href: "/settings", icon: Settings },
];

function SidebarContent({ onClose, isMobile = false }: { onClose?: () => void; isMobile?: boolean }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { isCollapsed, toggleCollapse } = useSidebarStore();

    return (
        <motion.aside 
            initial={false}
            animate={{ width: isMobile ? 256 : (isCollapsed ? 80 : 256) }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full flex-shrink-0 overflow-x-hidden"
        >
            {/* Logo Area */}
            <div className={cn(
                "h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 overflow-hidden",
                isCollapsed && !isMobile && "px-0 justify-center"
            )}>
                <AnimatePresence mode="wait">
                    {(!isCollapsed || isMobile) && (
                        <motion.div 
                            key="full-logo"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-3"
                        >
                            <div className="bg-primary/10 text-primary p-2 rounded-lg">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <h1 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">FocusOS</h1>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {isMobile ? (
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                ) : (
                    <button
                        onClick={toggleCollapse}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-1 custom-scrollbar">
                {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors group relative",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200",
                                isCollapsed && !isMobile && "justify-center px-1 gap-0 overflow-hidden"
                            )}
                        >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            <AnimatePresence initial={false}>
                                {(!isCollapsed || isMobile) && (
                                    <motion.span 
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.15, ease: "easeInOut" }}
                                        className="text-sm whitespace-nowrap overflow-hidden"
                                    >
                                        <span className="pl-3">{item.name}</span>
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            {isCollapsed && !isMobile && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>


            {/* Theme Toggle */}
            <div className={cn("px-6 py-2 border-t border-slate-100 dark:border-slate-800", isCollapsed && !isMobile && "px-2 overflow-hidden")}>
                <div className={cn(
                    "flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800",
                    isCollapsed && !isMobile && "justify-center p-1"
                )}>
                    {(!isCollapsed || isMobile) && (
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">Theme</span>
                    )}
                    <ThemeToggle />
                </div>
            </div>

            {/* User Profile */}
            <div className={cn("p-4 border-t border-slate-200 dark:border-slate-800", isCollapsed && !isMobile && "p-2 flex justify-center overflow-hidden")}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className={cn(
                            "flex items-center w-full gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group outline-none",
                            isCollapsed && !isMobile && "justify-center gap-0"
                        )}>
                            <Avatar className={cn("h-9 w-9 border-2 border-white dark:border-slate-700 flex-shrink-0", isCollapsed && !isMobile && "mx-auto")}>
                                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                                <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            {(!isCollapsed || isMobile) && (
                                <>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                            {session?.user?.name || "User"}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">Pro Plan</p>
                                    </div>
                                    <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                </>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2 shadow-xl border-slate-200 dark:border-slate-800" side={isCollapsed && !isMobile ? "right" : "top"} sideOffset={10}>
                        <DropdownMenuLabel className="font-normal mb-1">
                            <div className="flex flex-col space-y-2 py-1">
                                <p className="text-sm font-bold leading-none text-slate-900 dark:text-white">
                                    {session?.user?.name}
                                </p>
                                <p className="text-xs leading-none text-slate-500 font-medium">
                                    {session?.user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
                        <DropdownMenuItem
                            onClick={() => signOut()}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 rounded-lg cursor-pointer transition-colors mt-1"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span className="font-semibold">Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.aside>
    );
}

export function Sidebar() {
    const { isOpen, close } = useSidebarStore();

    return (
        <>
            {/* Desktop: persistent with collapse toggle */}
            <div className="hidden md:flex h-full sticky top-0 overflow-hidden">
                <SidebarContent />
            </div>

            {/* Mobile: backdrop + slide-in drawer */}
            <AnimatePresence>
                {isOpen && (
                    <div className="md:hidden fixed inset-0 z-[100] flex">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={close}
                        />
                        {/* Drawer */}
                        <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative z-10 h-full"
                        >
                            <SidebarContent onClose={close} isMobile />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
