import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import LoadingOverlay from './LoadingOverlay';

type OverlayState = {
    visible: boolean;
    title?: string;
    subtitle?: string;
    progress?: number | null;
    blocking?: boolean;
    variant?: 'fullscreen' | 'inline';
};

type LoadingContextValue = {
    show: (options?: Partial<Omit<OverlayState, 'visible'>>) => void;
    hide: () => void;
    setProgress: (progress: number | null) => void;
    setText: (title?: string, subtitle?: string) => void;
    state: OverlayState;
};

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export const LoadingProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [state, setState] = useState<OverlayState>({
        visible: false,
        title: 'Loading',
        subtitle: undefined,
        progress: null,
        blocking: true,
        variant: 'fullscreen',
    });

    const show = useCallback((options?: Partial<Omit<OverlayState, 'visible'>>) => {
        setState((prev) => ({ ...prev, ...options, visible: true }));
    }, []);

    const hide = useCallback(() => {
        setState((prev) => ({ ...prev, visible: false, progress: null }));
    }, []);

    const setProgress = useCallback((progress: number | null) => {
        setState((prev) => ({ ...prev, progress }));
    }, []);

    const setText = useCallback((title?: string, subtitle?: string) => {
        setState((prev) => ({ ...prev, title, subtitle }));
    }, []);

    const value = useMemo<LoadingContextValue>(
        () => ({ show, hide, setProgress, setText, state }),
        [show, hide, setProgress, setText, state]
    );

    return (
        <LoadingContext.Provider value={value}>
            {children}
            <LoadingOverlay
                visible={state.visible}
                title={state.title}
                subtitle={state.subtitle}
                progress={state.progress ?? null}
                blocking={state.blocking}
                variant={state.variant}
            />
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const ctx = useContext(LoadingContext);
    if (!ctx) throw new Error('useLoading must be used within a LoadingProvider');
    return ctx;
};


