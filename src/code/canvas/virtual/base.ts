import { CanvasBase } from "../base.js";
import { IVirtualCanvas } from "./types.js";
import { VoidMessaging } from "../../messaging/impl.js";
import { IVoidMessaging } from "../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";

export abstract class VirtualCanvasBase<TConfiguration> extends CanvasBase implements IVirtualCanvas<TConfiguration> {
    private readonly config: Readonly<TConfiguration>;
    private readonly voidMessaging: IVoidMessaging;

    constructor(config: TConfiguration) {
        super();
        this.config = config;
        this.voidMessaging = new VoidMessaging();
    }

    public get configuration(): TConfiguration {
        return this.config;
    }

    abstract draw(): void;

    public onRedraw(listener: VoidListener): VoidUnsubscribe {
        return this.voidMessaging.listenOnChannel0(listener);
    }

    public override dispose(): void {
        this.voidMessaging.dispose();
        super.dispose();
    }

    protected invokeRedraw(): void {
        this.voidMessaging.sendToChannel0();
    }
}