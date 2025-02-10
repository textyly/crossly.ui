import { CanvasBase } from "../base.js";
import { CanvasConfig } from "../types.js";
import { IVirtualCanvas } from "./types.js";
import { VoidMessaging } from "../../messaging/impl.js";
import { IVoidMessaging } from "../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";

export abstract class VirtualCanvasBase<TConfig extends CanvasConfig> extends CanvasBase implements IVirtualCanvas<TConfig> {
    private readonly configuration: Readonly<TConfig>;
    private readonly voidMessaging: IVoidMessaging;

    private _dotColor!: string;
    private _dotRadius!: number;
    private _threadColor!: string;
    private _threadWidth!: number;

    constructor(config: TConfig) {
        super();
        this.configuration = config;
        this.setConfig(this.configuration);
        this.voidMessaging = new VoidMessaging();
    }

    public get config(): TConfig {
        return this.configuration;
    }

    protected get dotColor(): string {
        return this._dotColor;
    }

    protected get dotRadius(): number {
        return this._dotRadius;
    }

    protected get threadColor(): string {
        return this._threadColor;
    }

    protected get threadWidth(): number {
        return this._threadWidth;
    }

    public onRedraw(listener: VoidListener): VoidUnsubscribe {
        return this.voidMessaging.listenOnChannel0(listener);
    }

    public override dispose(): void {
        this.voidMessaging.dispose();
        super.dispose();
    }

    public abstract draw(): void;

    protected zoomIn(): void {
        this.zoomInDots();
        this.zoomInThreads();
        this.draw();
    }

    protected zoomOut(): void {
        this.zoomOutDots();
        this.zoomOutThreads();
        this.draw();
    }

    protected invokeRedraw(): void {
        this.voidMessaging.sendToChannel0();
    }

    private zoomInDots(): void {
        const configDotRadius = this.config.dot.radius;
        this._dotRadius += (this._dotRadius < configDotRadius.value)
            ? configDotRadius.zoomOutStep
            : configDotRadius.zoomInStep;
    }

    private zoomInThreads(): void {
        const configThreadWidth = this.config.thread.width;
        this._threadWidth += (this._threadWidth < configThreadWidth.value)
            ? configThreadWidth.zoomOutStep
            : configThreadWidth.zoomInStep;
    }

    private zoomOutDots(): void {
        const configDotRadius = this.config.dot.radius;
        this._dotRadius -= (this._dotRadius > configDotRadius.value)
            ? configDotRadius.zoomInStep
            : configDotRadius.zoomOutStep;
    }

    private zoomOutThreads(): void {
        const configThreadWidth = this.config.thread.width;
        this._threadWidth -= (this.threadWidth > configThreadWidth.value)
            ? configThreadWidth.zoomInStep
            : configThreadWidth.zoomOutStep;
    }

    private setConfig(config: CanvasConfig): void {
        const dotConfig = config.dot;
        this._dotColor = dotConfig.color;
        this._dotRadius = dotConfig.radius.value;

        const threadConfig = config.thread;
        this._threadColor = threadConfig.color;
        this._threadWidth = threadConfig.width.value;
    }
}