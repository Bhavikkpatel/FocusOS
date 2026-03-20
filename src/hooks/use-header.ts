import { useEffect } from "react";
import { useLayoutStore } from "@/store/layout";

export interface HeaderConfig {
    title?: string | React.ReactNode;
    showBackButton?: boolean;
    actions?: React.ReactNode;
}

export function useHeader(config: HeaderConfig) {
    const setHeaderConfig = useLayoutStore((s) => s.setHeaderConfig);

    useEffect(() => {
        setHeaderConfig(config);
        return () => {
            setHeaderConfig(null);
        };
    }, [config, setHeaderConfig]);
}
