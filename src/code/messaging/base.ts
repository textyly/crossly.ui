import { ErrorListener, Unsubscribe } from "../types.js";
import { MessagingBaseValidator } from "../validators/messaging/base.js";
import {
    IMessaging,
    ChannelListeners,
    Channel,
    ChannelListener,
    ChannelData,
    PrivateChannels
} from "./types.js";

export abstract class Messaging implements IMessaging {
    // #region fields

    private readonly name: string;

    private readonly errorChannel: Channel;
    private readonly validator: MessagingBaseValidator;

    private readonly privateChannels: Map<Channel, ChannelListeners>;
    private readonly publicChannels: Map<Channel, ChannelListeners>;

    private _started: boolean;

    // #endregion

    constructor(name: string) {
        this.name = name;

        this.errorChannel = PrivateChannels.Error;
        this.validator = new MessagingBaseValidator(name);

        this.privateChannels = new Map<Channel, ChannelListeners>;
        this.publicChannels = new Map<Channel, ChannelListeners>;

        this._started = false;
    }

    // #region interface

    public get started(): boolean {
        return this._started;
    }

    public onError(listener: ErrorListener): Unsubscribe<ChannelListener> {
        this.ensureStarted();

        this.validator.validateRef(listener, "listener");

        const un = this.onCore(this.errorChannel, listener, this.privateChannels);
        return un;
    }

    public start(): void {
        if (this._started) {
            return;
        }
        this._started = true;
    }

    public stop(): void {
        if (!this._started) {
            return;
        }
        this.privateChannels.clear();
        this.publicChannels.clear();
        this._started = false;
    }

    // #endregion

    // #region events

    protected on(channel: Channel, listener: ChannelListener): Unsubscribe<ChannelListener> {
        this.ensureStarted();

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
        this.ensureStarted();

        this.validator.validateSend(channel, data);
        this.ensureChannelExists(channel, this.publicChannels);

        const listeners = this.publicChannels.get(channel)!;
        listeners.forEach((l) => this.sendSafely(l, data));
    }

    private sendSafely(listener: ChannelListener, data: ChannelData): void {
        try {
            listener(data);
        } catch (error: unknown) {
            this.sendError(error);
        }
    }

    private sendError(error: unknown): void {
        const errorListeners = this.privateChannels.get(this.errorChannel);
        errorListeners?.forEach((listener) => {
            try {
                listener(error);
            } catch {
                // error listener has thrown error, we can only remain silent 
            }
        });
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

    private ensureStarted(): void {
        if (!this.start) {
            throw new Error(`${this.name} messaging is not started.`);
        }
    }

    private ensureChannelExists(channel: Channel, channels: Map<Channel, Array<ChannelListener>>): void {
        if (!channels.has(channel)) {
            throw new Error(`channel ${channel} does not exist or has been destroyed.`);
        }
    }

    // #endregion
}