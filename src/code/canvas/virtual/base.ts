import { CanvasBase } from "../base.js";
import { DotIndex, IVirtualCanvas } from "./types.js";
import { VoidMessaging } from "../../messaging/impl.js";
import { IVoidMessaging } from "../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";
import { Bounds, CanvasSide, CanvasConfig } from "../types.js";
import { IInputCanvas, MoveEvent, Position } from "../input/types.js";

export abstract class VirtualCanvasBase extends CanvasBase implements IVirtualCanvas {
    private readonly configuration: Readonly<CanvasConfig>;
    private readonly voidMessaging: IVoidMessaging;

    private virtualX = 0;
    private virtualY = 0;
    private virtualWidth = 0;
    private virtualHeight = 0;

    protected readonly inputCanvas: IInputCanvas;

    protected dotsSpacing: number;
    protected dotColor: string;
    protected dotRadius: number;

    protected threadColor: string;
    protected threadWidth: number;

    protected currentSide: CanvasSide;

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super();

        this.inputCanvas = inputCanvas;
        this.configuration = config;

        this.voidMessaging = new VoidMessaging();
        this.currentSide = CanvasSide.Back;

        this.dotsSpacing = config.dotSpacing.value / 2;

        const dotConfig = config.dot;
        this.dotColor = dotConfig.color;
        this.dotRadius = dotConfig.radius.value;

        const threadConfig = config.thread;
        this.threadColor = threadConfig.color;
        this.threadWidth = threadConfig.width.value;

        this.subscribe();
    }

    public get config(): CanvasConfig {
        return this.configuration;
    }

    protected get allDotsY(): number {
        const invisibleRows = this.config.rows - 1;
        const all = this.config.rows + invisibleRows;
        return all;
    }

    protected get allDotsX(): number {
        const invisibleColumns = this.config.columns - 1;
        const all = this.config.columns + invisibleColumns;
        return all;
    }

    protected get virtualBounds(): Bounds {
        const bounds = { x: this.virtualX, y: this.virtualY, width: this.virtualWidth, height: this.virtualHeight };
        return bounds;
    }

    private set virtualBounds(value: Bounds) {
        const newX = value.x;
        const newY = value.y;
        const newWidth = value.width;
        const newHeight = value.height;

        if (this.virtualX !== newX || this.virtualY !== newY || this.virtualWidth !== newWidth || this.virtualHeight !== newHeight) {
            this.virtualX = newX;
            this.virtualY = newY;
            this.virtualWidth = newWidth;
            this.virtualHeight = newHeight;
        }
    }

    public onRedraw(listener: VoidListener): VoidUnsubscribe {
        return this.voidMessaging.listenOnChannel0(listener);
    }

    public override dispose(): void {
        this.voidMessaging.dispose();
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
        this.voidMessaging.sendToChannel0();
    }

    protected getDotIndex(position: Position): DotIndex {
        const closestX = (position.x - this.virtualBounds.x) / this.dotsSpacing;
        const closestY = (position.y - this.virtualBounds.y) / this.dotsSpacing;

        const indexX = Math.round(closestX);
        const indexY = Math.round(closestY);

        const index = { indexX, indexY };
        return index;
    }

    protected getDotPosition(index: DotIndex): Position {
        const x = this.virtualBounds.x + (index.indexX * this.dotsSpacing);
        const y = this.virtualBounds.y + (index.indexY * this.dotsSpacing);
        return { x, y };
    }

    protected isInVirtualBounds(position: Position): boolean {
        const dotIndex = this.getDotIndex(position);
        const newPosition = this.getDotPosition(dotIndex);
        const x = newPosition.x;
        const y = newPosition.y;

        const vBounds = this.virtualBounds;
        const vX = vBounds.x;
        const vY = vBounds.y;
        const vWidth = vBounds.width;
        const vHeight = vBounds.height;

        const isInVirtualX = x >= vX && (x <= vX + vWidth);
        const isInVirtualY = y >= vY && (y <= vY + vHeight);
        const isInVirtualBounds = isInVirtualX && isInVirtualY;

        return isInVirtualBounds;
    }

    protected changeSide(): void {
        this.currentSide = this.currentSide === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
    }

    private subscribe(): void {
        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);

        const moveUn = this.inputCanvas.onMove(this.handleMove.bind(this));
        super.registerUn(moveUn);
    }

    private handleZoomIn(): void {
        this.zoomIn();
    }

    private handleZoomOut(): void {
        this.zoomOut();
    }

    private handleMove(event: MoveEvent): void {
        const difference = event.difference;
        this.move(difference);
    }

    private calculateVirtualBounds(): void {
        const x = this.virtualBounds.x;
        const y = this.virtualBounds.y;

        const width = (this.allDotsX - 1) * this.dotsSpacing;
        const height = (this.allDotsY - 1) * this.dotsSpacing;

        this.virtualBounds = { x, y, width, height };
    }

    private zoomInSpacing(): void {
        const configSpacing = this.config.dotSpacing;
        const spacing = (this.dotsSpacing < configSpacing.value)
            ? (this.dotsSpacing + this.config.dotSpacing.zoomOutStep)
            : (this.dotsSpacing + this.config.dotSpacing.zoomInStep);

        this.dotsSpacing = spacing;
    }

    private zoomOutSpacing(): void {
        const configSpacing = this.config.dotSpacing;
        const spacing = (this.dotsSpacing > configSpacing.value)
            ? (this.dotsSpacing - this.config.dotSpacing.zoomInStep)
            : (this.dotsSpacing - this.config.dotSpacing.zoomOutStep);

        this.dotsSpacing = spacing;
    }

    private zoomInDots(): void {
        const configDotRadius = this.config.dot.radius;
        this.dotRadius += (this.dotRadius < configDotRadius.value)
            ? configDotRadius.zoomOutStep
            : configDotRadius.zoomInStep;
    }

    private zoomOutDots(): void {
        const configDotRadius = this.config.dot.radius;
        this.dotRadius -= (this.dotRadius > configDotRadius.value)
            ? configDotRadius.zoomInStep
            : configDotRadius.zoomOutStep;
    }

    private zoomInThreads(): void {
        const configThreadWidth = this.config.thread.width;
        this.threadWidth += (this.threadWidth < configThreadWidth.value)
            ? configThreadWidth.zoomOutStep
            : configThreadWidth.zoomInStep;
    }

    private zoomOutThreads(): void {
        const configThreadWidth = this.config.thread.width;
        this.threadWidth -= (this.threadWidth > configThreadWidth.value)
            ? configThreadWidth.zoomInStep
            : configThreadWidth.zoomOutStep;
    }
}