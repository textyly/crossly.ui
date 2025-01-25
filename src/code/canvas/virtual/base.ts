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
    private _lineColor!: string;
    private _lineWidth!: number;

    constructor(config: TConfig) {
        super();
        this.configuration = config;
        this.setConfig(this.configuration);
        this.voidMessaging = new VoidMessaging();
    }

    public get config(): TConfig {
        return this.configuration;
    }

    public get dotColor(): string {
        return this._dotColor;
    }

    public set dotColor(value: string) {
        if (this._dotColor !== value) {
            this._dotColor = value;
            this.draw();
        }
    }

    public get dotRadius(): number {
        return this._dotRadius;
    }

    public set dotRadius(value: number) {
        if (this._dotRadius !== value) {
            this._dotRadius = value;
            this.draw();
        }
    }

    public get lineColor(): string {
        return this._lineColor;
    }

    public set lineColor(value: string) {
        if (this._lineColor !== value) {
            this._lineColor = value;
            this.draw();
        }
    }

    public get lineWidth(): number {
        return this._lineWidth;
    }

    public set lineWidth(value: number) {
        if (this._lineWidth !== value) {
            this._lineWidth = value;
            this.draw();
        }
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
        this._dotRadius += this.config.dot.radius.zoomStep;
        this._lineWidth += this.config.line.width.zoomStep;
        this.draw();
    }

    protected zoomOut(): void {
        this._dotRadius -= this.config.dot.radius.zoomStep;
        this._lineWidth -= this.config.line.width.zoomStep;
        this.draw();
    }

    protected invokeRedraw(): void {
        this.voidMessaging.sendToChannel0();
    }

    private setConfig(config: CanvasConfig): void {
        const dotConfig = config.dot;
        this._dotColor = dotConfig.color;
        this._dotRadius = dotConfig.radius.value;

        const lineConfig = config.line;
        this._lineColor = lineConfig.color;
        this._lineWidth = lineConfig.width.value;
    }
}