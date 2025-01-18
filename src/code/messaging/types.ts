// #region types 

import { IDisposable } from "../canvas/types.js";
import { Listener, VoidListener, VoidUnsubscribe } from "../types";

/**
 * 
 */
export type Channel = string;

/**
 * 
 */
export type ChannelData = any;

/**
 * 
 */
export type ChannelListener = Listener<ChannelData>;

/**
 * 
 */
export type ChannelListeners = Array<ChannelListener>;

// #endregion

// #region interfaces 

export interface IVoidMessaging extends IDisposable {

    /**
     * 
     * @param listener 
     */
    listenOnChannel0(listener: VoidListener): VoidUnsubscribe;

    /**
     * 
     */
    sendToChannel0(): void;
}

/**
* 
*/
export interface IMessaging1<Data> extends IVoidMessaging {

    /**
     * 
     * @param listener 
     */
    listenOnChannel1(listener: Listener<Data>): VoidUnsubscribe;

    /**
     * 
     * @param data 
     */
    sendToChannel1(data: Data): void;
}

/**
* 
*/
export interface IMessaging2<Data1, Data2> extends IMessaging1<Data1> {
    /**
     * 
     * @param listener 
     */
    listenOnChannel2(listener: Listener<Data2>): VoidUnsubscribe;

    /**
     * 
     * @param data 
     */
    sendToChannel2(data: Data2): void;
}


/**
* 
*/
export interface IMessaging3<Data1, Data2, Data3> extends IMessaging2<Data1, Data2> {

    /**
     * 
     * @param listener 
     */
    listenOnChannel3(listener: Listener<Data3>): VoidUnsubscribe;

    /**
     * 
     * @param data 
     */
    sendToChannel3(data: Data3): void;
}

/**
* 
*/
export interface IMessaging4<Data1, Data2, Data3, Data4> extends IMessaging3<Data1, Data2, Data3> {

    /**
     * 
     * @param listener 
     */
    listenOnChannel4(listener: Listener<Data4>): VoidUnsubscribe;

    /**
     * 
     * @param data 
     */
    sendToChannel4(data: Data4): void;
}

/**
 * 
 */
export interface IMessaging5<Data1, Data2, Data3, Data4, Data5> extends IMessaging4<Data1, Data2, Data3, Data4> {

    /**
     * 
     * @param listener 
     */
    listenOnChannel5(listener: Listener<Data5>): VoidUnsubscribe;

    /**
     * 
     * @param data 
     */
    sendToChannel5(data: Data5): void;
}

/**
 * 
 */
export interface IMessaging6<Data1, Data2, Data3, Data4, Data5, Data6> extends IMessaging5<Data1, Data2, Data3, Data4, Data5> {

    /**
     * 
     * @param listener 
     */
    listenOnChannel6(listener: Listener<Data6>): VoidUnsubscribe;

    /**
     * 
     * @param data 
     */
    sendToChannel6(data: Data6): void;
}

export interface IMessaging7<Data1, Data2, Data3, Data4, Data5, Data6, Data7> extends IMessaging6<Data1, Data2, Data3, Data4, Data5, Data6> {

    /**
     * 
     * @param listener 
     */
    listenOnChannel7(listener: Listener<Data7>): VoidUnsubscribe;

    /**
     * 
     * @param data 
     */
    sendToChannel7(data: Data7): void;
}

// #endregion

// #region enums

/**
 * 
 */
export enum PublicChannels {
    Channel0 = "channel0",
    Channel1 = "channel1",
    Channel2 = "channel2",
    Channel3 = "channel3",
    Channel4 = "channel4",
    Channel5 = "channel5",
    Channel6 = "channel6",
    Channel7 = "channel7",
}

export enum PrivateChannels {
    Error = "error",
}

// #endregion
