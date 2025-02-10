import { CanvasBase } from "../base.js";
import { IVirtualCanvas } from "./types.js";
import { Messaging1 } from "../../messaging/impl.js";
import { IMessaging1 } from "../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";
import {
    Bounds,
    CanvasConfig,
    BoundsChangeEvent,
    BoundsChangeListener,
} from "../types.js";

export abstract class VirtualCanvasBase<TConfig extends CanvasConfig> extends CanvasBase implements IVirtualCanvas<TConfig> {
    private readonly configuration: Readonly<TConfig>;
    private readonly vMessaging: IMessaging1<BoundsChangeEvent>;

    private vX: number;
    private vY: number;
    private vWidth: number;
    private vHeight: number;

    protected _dotColor!: string;
    protected _dotRadius!: number;
    protected _threadColor!: string;
    protected _threadWidth!: number;

    constructor(config: TConfig) {
        super();
        this.configuration = config;
        this.setConfig(this.configuration);
        this.vMessaging = new Messaging1();

        this.vX = 0;
        this.vY = 0;
        this.vWidth = 0;
        this.vHeight = 0;
    }

    public get virtualBounds(): Bounds {
        const bounds = { x: this.vX, y: this.vY, width: this.vWidth, height: this.vHeight };
        return bounds;
    }

    public set virtualBounds(value: Bounds) {
        const newX = value.x;
        const newY = value.y;
        const newWidth = value.width;
        const newHeight = value.height;

        if (this.vX !== newX || this.vY !== newY || this.vWidth !== newWidth || this.vHeight !== newHeight) {
            this.vX = newX;
            this.vY = newY;
            this.vWidth = newWidth;
            this.vHeight = newHeight;
            this.invokeVirtualBoundsChange(value);
        }
    }

    public get config(): TConfig {
        return this.configuration;
    }

    public onRedraw(listener: VoidListener): VoidUnsubscribe {
        return this.vMessaging.listenOnChannel0(listener);
    }

    public onVirtualBoundsChange(listener: BoundsChangeListener): VoidUnsubscribe {
        return this.vMessaging.listenOnChannel1(listener);
    }

    public override dispose(): void {
        this.vMessaging.dispose();
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
        this.vMessaging.sendToChannel0();
    }

    protected invokeVirtualBoundsChange(bounds: Bounds): void {
        const event = { bounds };
        this.vMessaging.sendToChannel1(event);
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
        this._threadWidth -= (this._threadWidth > configThreadWidth.value)
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