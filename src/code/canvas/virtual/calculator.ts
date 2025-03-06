import { DotIndex } from "./types.js";
import { CanvasBase } from "../base.js";
import { IInputCanvas, Position } from "../input/types.js";
import { Bounds, CanvasConfig, BoundsIndexes } from "../types.js";
import calculator from "../../utilities/canvas/calculator.js";

// TODO: Calculation logic should be extracted and this class should be removed
export abstract class VirtualCanvasCalculator extends CanvasBase {
    protected readonly inputCanvas: IInputCanvas;
    protected readonly config: Readonly<CanvasConfig>;

    private virtualLeft = 0;
    private virtualTop = 0;
    private virtualWidth = 0;
    private virtualHeight = 0;

    protected dotsSpacing: number;
    protected movingBounds?: Bounds;

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super();

        this.inputCanvas = inputCanvas;
        this.config = config;
        this.dotsSpacing = config.dotSpacing.value / 2;
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

    protected get visibleBounds(): Bounds {
        return this.movingBounds ?? this.inputCanvas.bounds;
    }

    protected get drawingBoundsIndexes(): BoundsIndexes {
        const virtualBounds = this.virtualBounds;
        const visibleBounds = this.visibleBounds;

        const leftTop = calculator.calculateDrawingLeftTop(virtualBounds, visibleBounds);
        const leftTopIndex = calculator.calculateDrawingIndex(virtualBounds, leftTop, this.dotsSpacing);

        const width = calculator.calculateDrawingWidth(virtualBounds, visibleBounds);
        const rightTop = { x: leftTop.x + width, y: leftTop.y };
        const rightTopIndex = calculator.calculateDrawingIndex(virtualBounds, rightTop, this.dotsSpacing);

        const height = calculator.calculateDrawingHeight(virtualBounds, visibleBounds);
        const leftBottom = { x: leftTop.x, y: leftTop.y + height };
        const leftBottomIndex = calculator.calculateDrawingIndex(virtualBounds, leftBottom, this.dotsSpacing);

        const rightBottom = { x: leftTop.x + width, y: leftTop.y + height };
        const rightBottomIndex = calculator.calculateDrawingIndex(virtualBounds, rightBottom, this.dotsSpacing);

        const boundsIndexes = {
            leftTop: leftTopIndex,
            rightTop: rightTopIndex,
            leftBottom: leftBottomIndex,
            rightBottom: rightBottomIndex
        };

        return boundsIndexes;
    }

    protected get virtualBounds(): Bounds {
        const bounds = {
            left: this.virtualLeft,
            top: this.virtualTop,
            width: this.virtualWidth,
            height: this.virtualHeight
        };
        return bounds;
    }

    protected set virtualBounds(value: Bounds) {
        const hasChange = (this.virtualLeft !== value.left) || (this.virtualTop !== value.top) || (this.virtualWidth !== value.width) || (this.virtualHeight !== value.height);
        if (hasChange) {
            this.virtualLeft = value.left;
            this.virtualTop = value.top;
            this.virtualWidth = value.width;
            this.virtualHeight = value.height;
        }
    }

    protected recalculateBounds(): void {
        this.virtualBounds = calculator.calculateVirtualBounds(this.virtualBounds, this.allDotsX, this.allDotsY, this.dotsSpacing, 0, 0);
        this.bounds = calculator.calculateDrawingBounds(this.virtualBounds, this.visibleBounds);
    }
}