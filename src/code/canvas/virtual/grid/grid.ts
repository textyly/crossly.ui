import { IGridCanvas } from "../types.js";
import { GridCanvasBase } from "./base.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { IInputCanvas, MoveEvent, Position } from "../../input/types.js";
import { Visibility, GridDot, GridThread, GridCanvasConfig } from "../../types.js";

export class GridCanvas extends GridCanvasBase implements IGridCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly threadIds: IdGenerator;

    private _allDotsY: Array<number>;
    private _allDotsX: Array<number>;

    private _visibleDotsY!: number;
    private _visibleDotsX!: number;

    private _dotsSpacing!: number;
    private _dotMatchDistance!: number;

    constructor(config: GridCanvasConfig, inputCanvas: IInputCanvas) {
        super(config);

        this.inputCanvas = inputCanvas;

        this._allDotsY = new Array<number>();
        this._allDotsX = new Array<number>();
        this.threadIds = new IdGenerator();

        this.initialize();
        this.subscribe();
    }

    private get allDotsY(): number {
        const invisibleRows = this._visibleDotsY - 1;
        const all = this._visibleDotsY + invisibleRows;
        return all;
    }

    private get allDotsX(): number {
        const invisibleColumns = this._visibleDotsX - 1;
        const all = this._visibleDotsX + invisibleColumns;
        return all;
    }

    public draw(): void {
        super.invokeRedraw();
        this.redraw();
    }

    public getDotById(id: number | undefined): GridDot | undefined {
        if (id !== undefined) {
            const x = this._allDotsX[id];
            const y = this._allDotsY[id];
            return { id, x, y };
        }
    }

    public getDotByPosition(position: Position): GridDot | undefined {
        const dotsX = this._allDotsX;
        const dotsY = this._allDotsY;
        const dotMatchDistance = this._dotMatchDistance;
        const dotsLength = this._allDotsX.length;

        for (let index = 0; index < dotsLength; ++index) {

            const distance = Math.sqrt((position.x - dotsX[index]) ** 2 + (position.y - dotsY[index]) ** 2);

            if (distance <= dotMatchDistance) {
                return { id: index, x: dotsX[index], y: dotsY[index] };
            }
        }
    }

    private initialize(): void {
        // make space for invisible dots, respectively invisible rows and columns
        this._dotsSpacing = this.config.spacing.value / 2;
        this._dotMatchDistance = this.config.dot.dotMatchDistance.value;

        this._visibleDotsY = this.config.rows;
        this._visibleDotsX = this.config.columns;
    }

    private subscribe(): void {
        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);

        const moveUn = this.inputCanvas.onMove(this.handleMove.bind(this));
        super.registerUn(moveUn);
    }

    private redraw(): void {
        this.calculateVirtualBounds();
        this.createAndDrawDots();
        this.createAndDrawThreads();
    }

    private handleZoomIn(): void {
        this.zoomInSpacing();
        this.zoomInDotMatchDistance();
        super.zoomIn();
    }

    private handleZoomOut(): void {
        this.zoomOutSpacing();
        this.zoomOutDotMatchDistance();
        super.zoomOut();
    }

    private handleMove(event: MoveEvent): void {
        const difference = event.difference;
        const x = this.virtualBounds.x + difference.x;
        const y = this.virtualBounds.y + difference.y;
        const width = this.virtualBounds.width;
        const height = this.virtualBounds.height;

        super.virtualBounds = { x, y, width, height };
        this.draw();
    }

    private createAndDrawDots(): void {
        const hasItems = this._allDotsX.length > 0;
        const bounds = this.virtualBounds;
        const spacing = this._dotsSpacing;

        const allRows = this.allDotsY;
        const allColumns = this.allDotsX;

        const dotsX = this._allDotsX;
        const dotsY = this._allDotsY;

        // do not touch `this` or any dynamic property in the loops for performance reasons!!!

        const visibleDotsX: Array<number> = [];
        const visibleDotsY: Array<number> = [];

        if (hasItems) {
            // TODO: extract in a new method
            let index = 0;
            for (let dotY = 0; dotY < allRows; dotY++) {
                const isVisibleRow = dotY % 2 === 0;
                for (let dotX = 0; dotX < allColumns; dotX++) {
                    const isVisibleColumn = dotX % 2 === 0;

                    const x = bounds.x + (dotX * spacing);
                    const y = bounds.y + (dotY * spacing);

                    dotsX[index] = x;
                    dotsY[index] = y;

                    if (isVisibleRow && isVisibleColumn) {
                        const isVisibleByX = x >= this.bounds.x && x <= this.bounds.width;
                        if (isVisibleByX) {
                            const isVisibleByY = y >= this.bounds.y && y <= this.bounds.height;
                            if (isVisibleByY) {
                                visibleDotsX.push(x);
                                visibleDotsY.push(y);
                            }
                        }
                    }

                    index++;
                }
            }
        } else {
            // TODO: extract in a new method
            let index = 0;
            for (let dotY = 0; dotY < allRows; dotY++) {
                const isVisibleRow = dotY % 2 === 0;
                for (let dotX = 0; dotX < allColumns; dotX++) {
                    const isVisibleColumn = dotX % 2 === 0;
                    const x = bounds.x + (dotX * spacing);
                    const y = bounds.y + (dotY * spacing);

                    dotsX.push(x);
                    dotsY.push(y);

                    if (isVisibleRow && isVisibleColumn) {
                        const isVisibleByX = x >= this.bounds.x && x <= this.bounds.width;
                        if (isVisibleByX) {
                            const isVisibleByY = y >= this.bounds.y && y <= this.bounds.height;
                            if (isVisibleByY) {
                                visibleDotsX.push(x);
                                visibleDotsY.push(y);
                            }
                        }
                    }

                    index++;
                }
            }
        }
        super.invokeDrawDots(visibleDotsX, visibleDotsY, this._dotRadius, this._dotColor);
    }

    private createAndDrawThreads(): void {
        this.threadIds.reset();
        this.createAndDrawColumnsThreads();
        this.createAndDrawRowsThreads();
    }

    private createAndDrawColumnsThreads(): void {
        const visibleThreads: Array<GridThread> = [];

        for (let columnIdx = 0; columnIdx < this.allDotsX; ++columnIdx) {
            const isVisibleColumn = columnIdx % 2 === 0;
            if (isVisibleColumn) {
                const visibleThread = this.createColumnThread(columnIdx, Visibility.Visible);
                visibleThreads.push(visibleThread);
            }
        }

        super.invokeDrawThreads(visibleThreads);
    }

    private createColumnThread(fromDotIndex: number, visibility: Visibility): GridThread {
        const fromDotX = this._allDotsX[fromDotIndex]!;
        const fromDotY = this._allDotsY[fromDotIndex]!;

        const toDoIndex = this.allDotsX * (this.allDotsY - 1) + (fromDotIndex);
        const toDotX = this._allDotsX[toDoIndex]!;
        const toDotY = this._allDotsY[toDoIndex]!;

        const id = this.threadIds.next();

        const from: GridDot = { id: fromDotIndex, x: fromDotX, y: fromDotY };
        const to: GridDot = { id: toDoIndex, x: toDotX, y: toDotY };

        const thread = { id, from, to, width: this._threadWidth, visibility, color: this._threadColor }
        return thread;
    }

    private createAndDrawRowsThreads(): void {
        const visibleThreads: Array<GridThread> = [];

        for (let rowIdx = 0; rowIdx < this.allDotsY; ++rowIdx) {
            const isVisibleColumn = rowIdx % 2 === 0;
            if (isVisibleColumn) {
                const visibleThread = this.createRowThread(rowIdx, Visibility.Visible);
                visibleThreads.push(visibleThread);
            }
        }

        super.invokeDrawThreads(visibleThreads);
    }

    private createRowThread(rowIdx: number, visibility: Visibility): GridThread {
        const fromDotIndex = rowIdx * this.allDotsX;
        const fromDotX = this._allDotsX[fromDotIndex]!;
        const fromDotY = this._allDotsY[fromDotIndex]!;

        const toDotIndex = (rowIdx * this.allDotsX) + (this.allDotsX - 1);
        const toDotX = this._allDotsX[toDotIndex]!;
        const toDotY = this._allDotsY[toDotIndex]!;

        const id = this.threadIds.next();
        const from: GridDot = { id: fromDotIndex, x: fromDotX, y: fromDotY };
        const to: GridDot = { id: toDotIndex, x: toDotX, y: toDotY };

        const thread = { id, from, to, width: this._threadWidth, visibility, color: this._threadColor }
        return thread;
    }

    private zoomInSpacing(): void {
        const configSpacing = this.config.spacing;
        const spacing = (this._dotsSpacing < configSpacing.value)
            ? (this._dotsSpacing + this.config.spacing.zoomOutStep)
            : (this._dotsSpacing + this.config.spacing.zoomInStep);

        this._dotsSpacing = spacing;
    }

    private zoomInDotMatchDistance(): void {
        const configDotMatchDistance = this.config.dot.dotMatchDistance;
        const dotMatchDistance = (this._dotMatchDistance < configDotMatchDistance.value)
            ? (this._dotMatchDistance + this.config.dot.dotMatchDistance.zoomOutStep)
            : (this._dotMatchDistance + this.config.dot.dotMatchDistance.zoomInStep);

        this._dotMatchDistance = dotMatchDistance;
    }

    private zoomOutSpacing(): void {
        // zoom in spacing
        const configSpacing = this.config.spacing;
        const spacing = (this._dotsSpacing > configSpacing.value)
            ? (this._dotsSpacing - this.config.spacing.zoomInStep)
            : (this._dotsSpacing - this.config.spacing.zoomOutStep);

        this._dotsSpacing = spacing;
    }

    private zoomOutDotMatchDistance(): void {
        const configDotMatchDistance = this.config.dot.dotMatchDistance;
        const dotMatchDistance = (this._dotMatchDistance > configDotMatchDistance.value)
            ? (this._dotMatchDistance - this.config.dot.dotMatchDistance.zoomInStep)
            : (this._dotMatchDistance - this.config.dot.dotMatchDistance.zoomOutStep);

        this._dotMatchDistance = dotMatchDistance;

    }

    private calculateVirtualBounds(): void {
        const x = this.virtualBounds.x;
        const y = this.virtualBounds.y;
        const width = this._dotsSpacing + ((this._visibleDotsX - 1) * this._dotsSpacing);
        const height = this._dotsSpacing + ((this._visibleDotsY - 1) * this._dotsSpacing);

        this.virtualBounds = { x, y, width, height };
    }
}