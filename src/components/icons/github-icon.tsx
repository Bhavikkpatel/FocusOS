import { cn } from "@/lib/utils";

export function GithubIcon({ className, variant = "dark" }: { className?: string, variant?: "dark" | "light" }) {
    const src = variant === "light" ? "/github-icon-light.png" : "/github-icon.png";
    return (
        <div className={cn("relative flex items-center justify-center overflow-hidden", className)}>
            <img 
                src={src} 
                alt="GitHub" 
                className="h-full w-full object-contain"
            />
        </div>
    );
}
