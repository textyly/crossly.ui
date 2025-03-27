import assert from "../asserts/assert.js";
import { Unsubscribe } from "../types.js";
import { Channel, ChannelData, ChannelListener, ChannelListeners, IMessaging } from "./types.js";

export abstract class Messaging implements IMessaging {
    private readonly channels: Map<Channel, ChannelListeners>;

    private disposed: boolean;
    private disposedErrMsg: string;

    constructor() {
        this.channels = new Map<Channel, ChannelListeners>();

        this.disposed = false;
        this.disposedErrMsg = `current ${Messaging.name} instance has been disposed.`;
    }

    public create(channel: Channel): void {
        assert.that(!this.disposed, this.disposedErrMsg);

        assert.isDefined(channel, "channel");
        assert.greaterThanZero(channel.length, "channel.length")
            ;
        const hasChannel = this.channels.has(channel);
        assert.that(!hasChannel, `channel ${channel} already exists.`);

        this.channels.set(channel, []);
    }

    public on(channel: Channel, listener: ChannelListener): Unsubscribe<ChannelListener> {
        assert.that(!this.disposed, this.disposedErrMsg);

        assert.isDefined(channel, "channel");
        assert.isDefined(listener, "listener");

        const listeners = this.channels.get(channel);
        assert.isDefined(listeners, `channel ${channel} does not exist.`);

        listeners.push(listener);
        return () => this.unsubscribe(channel, listener);
    }

    public send(channel: Channel, data: ChannelData): void {
        assert.that(!this.disposed, this.disposedErrMsg);

        assert.isDefined(channel, "channel");
        assert.isDefined(data, "data");

        const listeners = this.channels.get(channel);
        assert.isDefined(listeners, `channel ${channel} does not exist.`);

        listeners.forEach((listener) => listener(data));
    }

    public dispose(): void {
        assert.that(!this.disposed, this.disposedErrMsg);

        this.channels.clear();
        this.disposed = true;
    }

    private unsubscribe(channel: Channel, listener: ChannelListener): ChannelListener {
        assert.that(!this.disposed, this.disposedErrMsg);

        assert.isDefined(channel, "channel");
        assert.isDefined(listener, "listener");

        const listeners = this.channels.get(channel);
        assert.isDefined(listeners, `channel ${channel} does not exist.`);

        const index = listeners.findIndex((l) => l === listener);
        assert.that(index > -1, `listener not found for channel: ${channel}`);

        return listeners.splice(index, 1)[0];
    }
}
