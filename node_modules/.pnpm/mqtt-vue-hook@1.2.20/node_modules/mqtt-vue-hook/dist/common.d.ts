declare const _default: {
    eq: (filter: string, topic: string, handleSharedSubscription?: boolean) => boolean;
    debug: () => {
        log: (...data: any[]) => void;
        error: (...data: any[]) => void;
        warn: (...data: any[]) => void;
        info: (...data: any[]) => void;
    };
};
export default _default;
