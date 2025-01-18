import { IDisposable } from "../canvas/types.js";
import { ErrorListener, Unsubscribe } from "../types.js";
import { MessagingBaseValidator } from "../validators/messaging/base.js";
import {
    ChannelListeners,
    Channel,
    ChannelListener,
    ChannelData,
    PrivateChannels
} from "./types.js";

export abstract class Messaging implements IDisposable {
    // #region fields

    private readonly name: string;

    private readonly errorChannel: Channel;
    private readonly validator: MessagingBaseValidator;

    private readonly privateChannels: Map<Channel, ChannelListeners>;
    private readonly publicChannels: Map<Channel, ChannelListeners>;

    // #endregion

    constructor(name: string) {
        this.name = name;

        this.errorChannel = PrivateChannels.Error;
        this.validator = new MessagingBaseValidator(name);

        this.privateChannels = new Map<Channel, ChannelListeners>;
        this.publicChannels = new Map<Channel, ChannelListeners>;
    }

    // #region interface

    public onError(listener: ErrorListener): Unsubscribe<ChannelListener> {
        this.validator.validateRef(listener, "listener");

        const un = this.onCore(this.errorChannel, listener, this.privateChannels);
        return un;
    }

    public dispose(): void {
        this.privateChannels.clear();
        this.publicChannels.clear();
    }

    // #endregion

    // #region events

    protected on(channel: Channel, listener: ChannelListener): Unsubscribe<ChannelListener> {
        this.validator.validateOn(channel, listener);
        this.ensureChannelExists(channel, this.publicChannels);

        const un = this.onCore(channel, listener, this.publicChannels);
        return un;
    }

    private onCore(channel: Channel, listener: ChannelListener, channels: Map<Channel, Array<ChannelListener>>): Unsubscribe<ChannelListener> {
        const listeners = channels.get(channel)!;
        listeners.push(listener);

        return () => this.unsubscribe(channel, listener);
    }

    // #endregion

    // #region methods

    protected create(channel: Channel): void {
        this.validator.validateCreate(channel);

        const hasChannel = this.publicChannels.has(channel);
        if (!hasChannel) {
            this.publicChannels.set(channel, []);
        }
    }

    protected send(channel: Channel, data: ChannelData): void {
        this.validator.validateSend(channel, data);
        this.ensureChannelExists(channel, this.publicChannels);

        const listeners = this.publicChannels.get(channel)!;
        listeners.forEach((listener) => listener(data));
    }

    private unsubscribe(channel: Channel, listener: ChannelListener): ChannelListener | undefined {
        const hasChannel = this.publicChannels.has(channel);
        if (hasChannel) {
            const listeners = this.publicChannels.get(channel)!;
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

    // #endregion
}