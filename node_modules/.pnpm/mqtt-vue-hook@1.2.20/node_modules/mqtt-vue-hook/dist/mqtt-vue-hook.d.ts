import { MqttOptions } from './hook';
declare const _default: {
    install: (_app: any, url: string, options: MqttOptions) => Promise<void>;
};
export default _default;
export declare const useMQTT: () => import("./hook").MqttHook;
