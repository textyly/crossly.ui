import assert from "../asserts/assert.js";
import { Unsubscribe } from "../types.js";
import { Channel, ChannelData, ChannelListener, ChannelListeners, IMessaging } from "./types.js";

export abstract class MessagingBase implements IMessaging {
    private readonly className: string;
    private readonly channels: Map<Channel, ChannelListeners>;
    private disposed: boolean;

    constructor() {
        this.className = MessagingBase.name;
        this.channels = new Map<Channel, ChannelListeners>();
        this.disposed = false;
    }

    public create(channel: Channel): void {
        this.ensureAlive();

        assert.defined(channel, "channel");
        assert.greaterThanZero(channel.length, "channel.length");

        const hasChannel = this.channels.has(channel);
        assert.that(!hasChannel, `channel ${channel} already exists.`);

        this.channels.set(channel, []);
    }

    public on(channel: Channel, listener: ChannelListener): Unsubscribe<ChannelListener> {
        this.ensureAlive();

        assert.defined(channel, "channel");
        assert.defined(listener, "listener");

        const listeners = this.channels.get(channel);
        assert.defined(listeners, `channel ${channel} does not exist.`);

        listeners.push(listener);
        return () => this.unsubscribe(channel, listener);
    }

    public send(channel: Channel, data: ChannelData): void {
        this.ensureAlive();

        assert.defined(channel, "channel");
        assert.defined(data, "data");

        const listeners = this.channels.get(channel);
        assert.defined(listeners, `channel ${channel} does not exist.`);

        listeners.forEach((listener) => listener(data));
    }

    public dispose(): void {
        this.ensureAlive();

        this.channels.clear();
        this.disposed = true;
    }

    private unsubscribe(channel: Channel, listener: ChannelListener): ChannelListener {
        this.ensureAlive();

        const listeners = this.channels.get(channel);
        assert.defined(listeners, `channel ${channel} does not exist.`);

        const index = listeners.findIndex((l) => l === listener);
        assert.positive(index, "index");

        const removed = listeners.splice(index, 1);
        assert.greaterThanZero(removed.length, "removed.length");

        return removed[0];
    }

    private ensureAlive(): void {
        assert.alive(this.disposed, this.className);
    }
}
