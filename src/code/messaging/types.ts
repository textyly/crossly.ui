import { IDisposable } from "../canvas/types.js";
import { Listener, VoidListener, VoidUnsubscribe } from "../types";

export type Channel = string;
export type ChannelData = any;

export interface IVoidMessaging extends IDisposable {
    listenOnChannel0(listener: VoidListener): VoidUnsubscribe;
    sendToChannel0(): void;
}

export interface IMessaging1<Data> extends IVoidMessaging {
    listenOnChannel1(listener: Listener<Data>): VoidUnsubscribe;
    sendToChannel1(data: Data): void;
}

export interface IMessaging2<Data1, Data2> extends IMessaging1<Data1> {
    listenOnChannel2(listener: Listener<Data2>): VoidUnsubscribe;
    sendToChannel2(data: Data2): void;
}

export interface IMessaging3<Data1, Data2, Data3> extends IMessaging2<Data1, Data2> {
    listenOnChannel3(listener: Listener<Data3>): VoidUnsubscribe;
    sendToChannel3(data: Data3): void;
}

export interface IMessaging4<Data1, Data2, Data3, Data4> extends IMessaging3<Data1, Data2, Data3> {
    listenOnChannel4(listener: Listener<Data4>): VoidUnsubscribe;
    sendToChannel4(data: Data4): void;
}

export interface IMessaging5<Data1, Data2, Data3, Data4, Data5> extends IMessaging4<Data1, Data2, Data3, Data4> {
    listenOnChannel5(listener: Listener<Data5>): VoidUnsubscribe;
    sendToChannel5(data: Data5): void;
}

export interface IMessaging6<Data1, Data2, Data3, Data4, Data5, Data6> extends IMessaging5<Data1, Data2, Data3, Data4, Data5> {
    listenOnChannel6(listener: Listener<Data6>): VoidUnsubscribe;
    sendToChannel6(data: Data6): void;
}

export interface IMessaging7<Data1, Data2, Data3, Data4, Data5, Data6, Data7> extends IMessaging6<Data1, Data2, Data3, Data4, Data5, Data6> {
    listenOnChannel7(listener: Listener<Data7>): VoidUnsubscribe;
    sendToChannel7(data: Data7): void;
}

export interface IMessaging8<Data1, Data2, Data3, Data4, Data5, Data6, Data7, Data8> extends IMessaging7<Data1, Data2, Data3, Data4, Data5, Data6, Data7> {
    listenOnChannel8(listener: Listener<Data8>): VoidUnsubscribe;
    sendToChannel8(data: Data8): void;
}

export enum Channels {
    Channel0 = "channel0",
    Channel1 = "channel1",
    Channel2 = "channel2",
    Channel3 = "channel3",
    Channel4 = "channel4",
    Channel5 = "channel5",
    Channel6 = "channel6",
    Channel7 = "channel7",
    Channel8 = "channel8",
}

export type ChannelListener = Listener<ChannelData>;
export type ChannelListeners = Array<ChannelListener>;
