"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    CheckCircle,
    ListTodo,
    FolderOpen,
    BarChart2,
    CalendarDays,
    Settings,
    ChevronUp,
    LogOut
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

const navigation = [
    { name: "Tasks", href: "/tasks", icon: ListTodo },
    { name: "Projects", href: "/projects", icon: FolderOpen },
    { name: "Calendar", href: "/calendar", icon: CalendarDays },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full flex-shrink-0 z-20 hidden md:flex transition-all duration-300">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <h1 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">FocusOS</h1>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Theme Toggle & User Profile (Bottom) */}
            <div className="px-6 py-2">
                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">Theme</span>
                    <ThemeToggle />
                </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center w-full gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group outline-none">
                            <Avatar className="h-9 w-9 border-2 border-white dark:border-slate-700">
                                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                                <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                    {session?.user?.name || "User"}
                                </p>
                                <p className="text-xs text-slate-500 truncate">Pro Plan</p>
                            </div>
                            <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2 shadow-xl border-slate-200 dark:border-slate-800" side="right" sideOffset={10}>
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
        </aside>
    );
}
