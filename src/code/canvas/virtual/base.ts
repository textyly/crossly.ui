import { CanvasBase } from "../base.js";
import { Position } from "../input/types.js";
import { Messaging1 } from "../../messaging/impl.js";
import { DotIndex, IVirtualCanvas } from "./types.js";
import { IMessaging1 } from "../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";
import {
    Bounds,
    CanvasConfig,
    BoundsChangeEvent,
    BoundsChangeListener,
    CanvasSide,
} from "../types.js";

export abstract class VirtualCanvasBase extends CanvasBase implements IVirtualCanvas<CanvasConfig> {
    protected _visibleDotsY!: number;
    protected _visibleDotsX!: number;
    protected _dotsSpacing!: number;
    protected _dotColor!: string;
    protected _dotRadius!: number;

    protected _threadColor!: string;
    protected _threadWidth!: number;

    protected currentSide: CanvasSide;

    private readonly configuration: Readonly<CanvasConfig>;
    private readonly vMessaging: IMessaging1<BoundsChangeEvent>;

    private vX: number;
    private vY: number;
    private vWidth: number;
    private vHeight: number;

    constructor(config: CanvasConfig) {
        super();

        this.configuration = config;
        this.setConfig(this.configuration);
        this.vMessaging = new Messaging1();

        this.vX = 0;
        this.vY = 0;
        this.vWidth = 0;
        this.vHeight = 0;
        this.currentSide = CanvasSide.Back;
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

    public get config(): CanvasConfig {
        return this.configuration;
    }

    protected get allDotsY(): number {
        const invisibleRows = this._visibleDotsY - 1;
        const all = this._visibleDotsY + invisibleRows;
        return all;
    }

    protected get allDotsX(): number {
        const invisibleColumns = this._visibleDotsX - 1;
        const all = this._visibleDotsX + invisibleColumns;
        return all;
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

    public draw(): void {
        this.invokeRedraw();
        this.calculateVirtualBounds();
        this.redraw();
    }

    protected abstract redraw(): void;

    protected zoomIn(): void {
        this.zoomInSpacing();
        this.zoomInDots();
        this.zoomInThreads();
        this.draw();
    }

    protected zoomOut(): void {
        this.zoomOutSpacing();
        this.zoomOutDots();
        this.zoomOutThreads();
        this.draw();
    }

    protected move(difference: Position): void {
        const x = this.virtualBounds.x + difference.x;
        const y = this.virtualBounds.y + difference.y;
        const width = this.virtualBounds.width;
        const height = this.virtualBounds.height;

        this.virtualBounds = { x, y, width, height };
        this.draw();
    }

    protected invokeRedraw(): void {
        this.vMessaging.sendToChannel0();
    }

    protected invokeVirtualBoundsChange(bounds: Bounds): void {
        const event = { bounds };
        this.vMessaging.sendToChannel1(event);
    }

    protected calculateVirtualBounds(): void {
        const x = this.virtualBounds.x;
        const y = this.virtualBounds.y;
        const width = (this.allDotsX - 1) * this._dotsSpacing;
        const height = (this.allDotsY - 1) * this._dotsSpacing;

        this.virtualBounds = { x, y, width, height };
    }

    protected getDotIndex(position: Position): DotIndex {
        const closestX = (position.x - this.virtualBounds.x) / this._dotsSpacing;
        const closestY = (position.y - this.virtualBounds.y) / this._dotsSpacing;

        const indexX = Math.round(closestX);
        const indexY = Math.round(closestY);

        const index = { indexX, indexY };
        return index;
    }

    protected getDotPosition(index: DotIndex): Position {
        const x = this.virtualBounds.x + (index.indexX * this._dotsSpacing);
        const y = this.virtualBounds.y + (index.indexY * this._dotsSpacing);
        return { x, y };
    }

    protected changeSide(): void {
        this.currentSide = this.currentSide === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
    }

    private zoomInSpacing(): void {
        const configSpacing = this.config.spacing;
        const spacing = (this._dotsSpacing < configSpacing.value)
            ? (this._dotsSpacing + this.config.spacing.zoomOutStep)
            : (this._dotsSpacing + this.config.spacing.zoomInStep);

        this._dotsSpacing = spacing;
    }

    private zoomOutSpacing(): void {
        const configSpacing = this.config.spacing;
        const spacing = (this._dotsSpacing > configSpacing.value)
            ? (this._dotsSpacing - this.config.spacing.zoomInStep)
            : (this._dotsSpacing - this.config.spacing.zoomOutStep);

        this._dotsSpacing = spacing;
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
        // make space for invisible dots, respectively invisible rows and columns
        this._dotsSpacing = config.spacing.value / 2;

        this._visibleDotsY = config.rows;
        this._visibleDotsX = config.columns;

        const dotConfig = config.dot;
        this._dotColor = dotConfig.color;
        this._dotRadius = dotConfig.radius.value;

        const threadConfig = config.thread;
        this._threadColor = threadConfig.color;
        this._threadWidth = threadConfig.width.value;
    }
}