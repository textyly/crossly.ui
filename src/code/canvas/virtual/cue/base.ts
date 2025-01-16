import { Messaging4 } from "../../../messaging/impl.js";
import { IMessaging4 } from "../../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../../types.js";
import { CanvasBase } from "../../base.js";
import {
    Dot,
    DrawLinkEvent,
    DrawLinkListener,
    HoverDotEvent,
    HoverDotListener,
    Link,
    RemoveLinkEvent,
    RemoveLinkListener,
    UnhoverDotEvent,
    UnhoverDotListener
} from "../types.js";

export abstract class CueVirtualCanvasBase extends CanvasBase {
    private readonly messaging: IMessaging4<HoverDotEvent, UnhoverDotEvent, DrawLinkEvent, RemoveLinkEvent>;

    constructor() {
        super();

        const className = CueVirtualCanvasBase.name;
        this.messaging = new Messaging4(className);
        this.messaging.start();
    }

    public onRedraw(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel0(listener);
    }

    public onHoverDot(listener: HoverDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onUnhoverDot(listener: UnhoverDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public onDrawLink(listener: DrawLinkListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel3(listener);
    }

    public onRemoveLink(listener: RemoveLinkListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel4(listener);
    }

    public invokeRedraw(): void {
        this.messaging.sendToChannel0();
    }

    public invokeHoverDot(dot: Dot): void {
        const hoverDotEvent = { dot };
        this.messaging.sendToChannel1(hoverDotEvent);
    }

    public invokeUnhoverDot(dot: Dot): void {
        const unhoverDotEvent = { dot };
        this.messaging.sendToChannel2(unhoverDotEvent);
    }

    public invokeDrawLink(link: Link): void {
        const drawLinkEvent = { link };
        this.messaging.sendToChannel3(drawLinkEvent);
    }

    public invokeRemoveLink(link: Link): void {
        const removeLinkEvent = { link };
        this.messaging.sendToChannel4(removeLinkEvent);
    }

    protected override initializeCore(): void {
    }

    protected override sizeChangeCore(): void {
    }

    protected override disposeCore(): void {
        this.messaging.stop();
    }
}