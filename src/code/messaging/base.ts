import { Unsubscribe } from "../types.js";
import { IDisposable } from "../canvas/types.js";
import { Channel, ChannelData, ChannelListener, ChannelListeners } from "./types.js";

export abstract class Messaging implements IDisposable {
    private readonly channels: Map<Channel, ChannelListeners>;

    constructor() {
        this.channels = new Map<Channel, ChannelListeners>;
    }

    public dispose(): void {
        this.channels.clear();
    }

    protected on(channel: Channel, listener: ChannelListener): Unsubscribe<ChannelListener> {
        this.ensureChannelExists(channel, this.channels);

        const un = this.onCore(channel, listener, this.channels);
        return un;
    }

    private onCore(channel: Channel, listener: ChannelListener, channels: Map<Channel, Array<ChannelListener>>): Unsubscribe<ChannelListener> {
        const listeners = channels.get(channel)!;
        listeners.push(listener);

        return () => this.unsubscribe(channel, listener);
    }

    protected create(channel: Channel): void {
        const hasChannel = this.channels.has(channel);
        if (!hasChannel) {
            this.channels.set(channel, []);
        }
    }

    protected send(channel: Channel, data: ChannelData): void {
        this.ensureChannelExists(channel, this.channels);

        const listeners = this.channels.get(channel)!;
        listeners.forEach((listener) => listener(data));
    }

    private unsubscribe(channel: Channel, listener: ChannelListener): ChannelListener | undefined {
        const hasChannel = this.channels.has(channel);
        if (hasChannel) {
            const listeners = this.channels.get(channel)!;
            const index = listeners.findIndex((l) => l === listener);
            if (index > -1) {
                const l = listeners.splice(index, 1);
                return l[0];
            }
        }
    }

    private ensureChannelExists(channel: Channel, channels: Map<Channel, Array<ChannelListener>>): void {
        if (!channels.has(channel)) {
            throw new Error(`channel ${channel} does not exist or has been destroyed.`);
        }
    }
}