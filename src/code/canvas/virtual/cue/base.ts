import { VirtualCanvasBase } from "../base.js";
import { Link, GridDot } from "../../types.js";
import { VoidUnsubscribe } from "../../../types.js";
import { Messaging4 } from "../../../messaging/impl.js";
import { IMessaging4 } from "../../../messaging/types.js";
import {
    DrawLinkEvent,
    DrawLinkListener,
    HoverGridDotEvent,
    HoverDotListener,
    RemoveLinkEvent,
    RemoveLinkListener,
    UnhoverGridDotEvent,
    UnhoverDotListener,
    CueCanvasConfig
} from "../types.js";

export abstract class CueCanvasBase extends VirtualCanvasBase<CueCanvasConfig> {
    private readonly messaging: IMessaging4<HoverGridDotEvent, UnhoverGridDotEvent, DrawLinkEvent, RemoveLinkEvent>;

    constructor() {
        super();
        this.messaging = new Messaging4();
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

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeHoverDot(dot: GridDot): void {
        const hoverDotEvent = { dot };
        this.messaging.sendToChannel1(hoverDotEvent);
    }

    protected invokeUnhoverDot(dot: GridDot): void {
        const unhoverDotEvent = { dot };
        this.messaging.sendToChannel2(unhoverDotEvent);
    }

    protected invokeDrawLink(link: Link): void {
        const drawLinkEvent = { link };
        this.messaging.sendToChannel3(drawLinkEvent);
    }

    protected invokeRemoveLink(link: Link): void {
        const removeLinkEvent = { link };
        this.messaging.sendToChannel4(removeLinkEvent);
    }
}