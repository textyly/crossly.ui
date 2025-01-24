import { CanvasBase } from "../base.js";
import { IVirtualCanvas } from "./types.js";
import { VoidMessaging } from "../../messaging/impl.js";
import { IVoidMessaging } from "../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";

export abstract class VirtualCanvasBase<TConfig> extends CanvasBase implements IVirtualCanvas<TConfig> {
    private readonly configuration: Readonly<TConfig>;
    private readonly voidMessaging: IVoidMessaging;

    constructor(config: TConfig) {
        super();
        this.configuration = config;
        this.voidMessaging = new VoidMessaging();
    }

    public get config(): TConfig {
        return this.configuration;
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