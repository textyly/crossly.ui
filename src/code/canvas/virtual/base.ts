import { CanvasBase } from "../base.js";
import { Messaging6 } from "../../messaging/impl.js";
import { IMessaging6 } from "../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";
import {
    HoverDotEvent,
    HoverDotListener,
    UnhoverDotEvent,
    UnhoverDotListener,
    IVirtualCanvas,
    DrawLineEvent,
    DrawLineListener,
    DrawLinkEvent,
    DrawLinkListener,
    DrawDotEvent,
    DrawDotListener,
    RemoveLinkListener,
    RemoveLinkEvent
} from "./types.js";

export abstract class VirtualCanvasBase extends CanvasBase implements IVirtualCanvas {
    // #region fields

    private readonly messaging: IMessaging6<DrawDotEvent, DrawLineEvent, DrawLinkEvent, RemoveLinkEvent, HoverDotEvent, UnhoverDotEvent>;

    // #endregion

    constructor() {
        super();

        const className = VirtualCanvasBase.name;
        this.messaging = new Messaging6(className);
        this.messaging.start();
    }

    // #region interface

    public onRedraw(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel0(listener);
    }

    public onDrawDot(listener: DrawDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onDrawLine(listener: DrawLineListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public onDrawLink(listener: DrawLinkListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel3(listener);
    }

    public onRemoveLink(listener: RemoveLinkListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel4(listener);
    }

    public onHoverDot(listener: HoverDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel5(listener);
    }

    public onUnhoverDot(listener: UnhoverDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel6(listener);
    }

    // #region abstract

    public abstract draw(): void;

    // #endregion

    // #endregion

    // #region overrides

    public override dispose(): void {
        this.messaging.stop();
        super.dispose();
    }

    // #endregion 

    // #region events

    protected invokeRedraw(): void {
        this.messaging.sendToChannel0();
    }

    protected invokeDrawDot(event: DrawDotEvent): void {
        this.messaging.sendToChannel1(event);
    }

    protected invokeDrawLine(event: DrawLineEvent): void {
        this.messaging.sendToChannel2(event);
    }

    protected invokeDrawLink(event: DrawLinkEvent): void {
        this.messaging.sendToChannel3(event);
    }

    protected invokeRemoveLink(event: RemoveLinkEvent): void {
        this.messaging.sendToChannel4(event);
    }

    protected invokeHoverDot(event: HoverDotEvent): void {
        this.messaging.sendToChannel5(event);
    }

    protected invokeUnhoverDot(event: UnhoverDotEvent): void {
        this.messaging.sendToChannel6(event);
    }

    // #endregion

    // #region methods

    // #endregion
}