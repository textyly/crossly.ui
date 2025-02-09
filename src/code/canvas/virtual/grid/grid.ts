import { GridCanvasBase } from "./base.js";
import { IDotMatcher, IGridCanvas } from "../types.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { IInputCanvas, MoveEvent, Position } from "../../input/types.js";
import { Visibility, GridDot, GridThread, GridCanvasConfig } from "../../types.js";

export class GridCanvas extends GridCanvasBase implements IGridCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly dotMatcher: IDotMatcher;
    private readonly threadIds: IdGenerator;

    private dotsX: Array<number>;
    private dotsY: Array<number>;

    private _spacing!: number;
    private _spacingZoomInStep!: number;
    private _spacingZoomOutStep!: number;

    private _dotMatchDistance!: number;
    private _dotMatchDistanceZoomInStep!: number;
    private _dotMatchDistanceZoomOutStep!: number;

    private _visibleRows!: number;
    private _visibleColumns!: number;

    constructor(config: GridCanvasConfig, inputCanvas: IInputCanvas, dotMatcher: IDotMatcher) {
        super(config);

        this.inputCanvas = inputCanvas;
        this.dotMatcher = dotMatcher;

        this.dotsX = new Array<number>();
        this.dotsY = new Array<number>();
        this.threadIds = new IdGenerator();

        this.initialize();
        this.subscribe();
    }

    public get rows(): number {
        return this._visibleRows;
    }

    public set rows(value: number) {
        if (this._visibleRows !== value) {
            this._visibleRows = value;
            this.draw();
        }
    }

    public get columns(): number {
        return this._visibleColumns;
    }

    public set columns(value: number) {
        if (this._visibleColumns !== value) {
            this._visibleColumns = value;
            this.draw();
        }
    }

    public get spacing(): number {
        return this._spacing;
    }

    private get allRows(): number {
        const invisibleRows = this._visibleRows - 1;
        const all = this._visibleRows + invisibleRows;
        return all;
    }

    private get allColumns(): number {
        const invisibleColumns = this._visibleColumns - 1;
        const all = this._visibleColumns + invisibleColumns;
        return all;
    }

    public draw(): void {
        super.invokeRedraw();
        this.redraw();
    }

    public getDotById(id: number | undefined): GridDot | undefined {
        if (id !== undefined) {
            const x = this.dotsX[id];
            const y = this.dotsY[id];
            return { id, x, y };
        }
    }

    public getDotByPosition(position: Position): GridDot | undefined {
        const dotsX = this.dotsX;
        const dotsY = this.dotsY;
        const dotMatchDistance = this._dotMatchDistance;
        const dotsLength = this.dotsX.length;

        for (let index = 0; index < dotsLength; ++index) {

            const distance = Math.sqrt((position.x - dotsX[index]) ** 2 + (position.y - dotsY[index]) ** 2);

            if (distance <= dotMatchDistance) {
                return { id: index, x: dotsX[index], y: dotsY[index] };
            }
        }
    }

    private initialize(): void {
        // make space for invisible dots, respectively invisible rows and columns
        const spacing = this.config.spacing.value / 2;

        this._spacing = spacing
        this._spacingZoomInStep = this.config.spacing.zoomInStep;
        this._spacingZoomOutStep = this.config.spacing.zoomOutStep;

        const dotMatchDistance = this.config.dot.dotMatchDistance;
        this._dotMatchDistance = dotMatchDistance.value;
        this._dotMatchDistanceZoomInStep = dotMatchDistance.zoomInStep;
        this._dotMatchDistanceZoomOutStep = dotMatchDistance.zoomOutStep;

        this._visibleRows = this.config.rows;
        this._visibleColumns = this.config.columns;
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
        this.calculateBounds();
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
        const position = event.position;
        const x = position.x;
        const y = position.y;
        const width = this.bounds.width;
        const height = this.bounds.height;

        super.bounds = { x, y, width, height };
        this.draw();
    }

    private createAndDrawDots(): void {
        const hasItems = this.dotsX.length > 0;
        const bounds = this.bounds;
        const spacing = this.spacing;

        const allRows = this.allRows;
        const allColumns = this.allColumns;

        const dotsX = this.dotsX;
        const dotsY = this.dotsY;

        // do not touch `this` or dynamic property in the loops for performance reasons!!!
        if (hasItems) {
            let index = 0;
            for (let rowIdx = 0; rowIdx < allRows; rowIdx++) {
                for (let dotIdx = 0; dotIdx < allColumns; dotIdx++) {
                    dotsX[index] = bounds.x + (dotIdx * spacing);
                    dotsY[index] = bounds.y + (rowIdx * spacing);
                    index++;
                }
            }
        } else {
            for (let rowIdx = 0; rowIdx < allRows; rowIdx++) {
                for (let dotIdx = 0; dotIdx < allColumns; dotIdx++) {
                    dotsX.push(bounds.x + (dotIdx * spacing));
                    dotsY.push(bounds.y + (rowIdx * spacing));
                }
            }

        }


        super.invokeDrawVisibleDots(this.dotsX, this.dotsY, this.dotRadius, this.dotColor);
    }

    private createAndDrawThreads(): void {
        this.threadIds.reset();

        this.createAndDrawColumnsThreads();
        this.createAndDrawRowsThreads();
    }

    private createAndDrawColumnsThreads(): void {
        const visibleThreads: Array<GridThread> = [];
        const invisibleThreads: Array<GridThread> = [];

        for (let columnIdx = 0; columnIdx < this.allColumns; ++columnIdx) {
            const isVisibleColumn = columnIdx % 2 === 0;
            if (isVisibleColumn) {
                const visibleThread = this.createColumnThread(columnIdx, Visibility.Visible);
                visibleThreads.push(visibleThread);
            } else {
                const invisibleThread = this.createColumnThread(columnIdx, Visibility.Invisible);
                invisibleThreads.push(invisibleThread);
            }
        }

        super.invokeDrawVisibleThreads(visibleThreads);
        super.invokeDrawInvisibleThreads(invisibleThreads);
    }

    private createColumnThread(fromDotIndex: number, visibility: Visibility): GridThread {
        const fromDotX = this.dotsX[fromDotIndex]!;
        const fromDotY = this.dotsY[fromDotIndex]!;

        const toDoIndex = this.allColumns * (this.allRows - 1) + (fromDotIndex);
        const toDotX = this.dotsX[toDoIndex]!;
        const toDotY = this.dotsY[toDoIndex]!;

        const id = this.threadIds.next();

        const from: GridDot = { id: fromDotIndex, x: fromDotX, y: fromDotY };
        const to: GridDot = { id: toDoIndex, x: toDotX, y: toDotY };

        const thread = { id, from, to, width: this.threadWidth, visibility, color: this.threadColor }
        return thread;
    }

    private createAndDrawRowsThreads(): void {
        const visibleThreads: Array<GridThread> = [];
        const invisibleThreads: Array<GridThread> = [];

        for (let rowIdx = 0; rowIdx < this.allRows; ++rowIdx) {
            const isVisibleColumn = rowIdx % 2 === 0;
            if (isVisibleColumn) {
                const visibleThread = this.createRowThread(rowIdx, Visibility.Visible);
                visibleThreads.push(visibleThread);
            } else {
                const invisibleThread = this.createRowThread(rowIdx, Visibility.Invisible);
                invisibleThreads.push(invisibleThread);
            }
        }

        super.invokeDrawVisibleThreads(visibleThreads);
        super.invokeDrawInvisibleThreads(invisibleThreads);
    }

    private createRowThread(rowIdx: number, visibility: Visibility): GridThread {
        const fromDotIndex = rowIdx * this.allColumns;
        const fromDotX = this.dotsX[fromDotIndex]!;
        const fromDotY = this.dotsY[fromDotIndex]!;

        const toDotIndex = (rowIdx * this.allColumns) + (this.allColumns - 1);
        const toDotX = this.dotsX[toDotIndex]!;
        const toDotY = this.dotsY[toDotIndex]!;

        const id = this.threadIds.next();
        const from: GridDot = { id: fromDotIndex, x: fromDotX, y: fromDotY };
        const to: GridDot = { id: toDotIndex, x: toDotX, y: toDotY };

        const thread = { id, from, to, width: this.threadWidth, visibility, color: this.threadColor }
        return thread;
    }

    private zoomInSpacing(): void {
        const configSpacing = this.config.spacing;
        const spacing = (this.spacing < configSpacing.value)
            ? (this.spacing + this._spacingZoomOutStep)
            : (this.spacing + this._spacingZoomInStep);

        this._spacing = spacing;
    }

    private zoomInDotMatchDistance(): void {
        const configDotMatchDistance = this.config.dot.dotMatchDistance;
        const dotMatchDistance = (this._dotMatchDistance < configDotMatchDistance.value)
            ? (this._dotMatchDistance + this._dotMatchDistanceZoomOutStep)
            : (this._dotMatchDistance + this._dotMatchDistanceZoomInStep);

        this._dotMatchDistance = dotMatchDistance;
    }

    private zoomOutSpacing(): void {
        // zoom in spacing
        const configSpacing = this.config.spacing;
        const spacing = (this.spacing > configSpacing.value)
            ? (this.spacing - this._spacingZoomInStep)
            : (this.spacing - this._spacingZoomOutStep);

        this._spacing = spacing;
    }

    private zoomOutDotMatchDistance(): void {
        const configDotMatchDistance = this.config.dot.dotMatchDistance;
        const dotMatchDistance = (this._dotMatchDistance > configDotMatchDistance.value)
            ? (this._dotMatchDistance - this._dotMatchDistanceZoomInStep)
            : (this._dotMatchDistance - this._dotMatchDistanceZoomOutStep);

        this._dotMatchDistance = dotMatchDistance;

    }

    private calculateBounds(): void {
        // TODO: check this calculations whether they can become simpler
        const x = this.bounds.x;
        const y = this.bounds.y;
        const width = this.spacing + (this.allColumns * this.dotRadius) + ((this.allColumns - 1) * this.spacing);
        const height = this.spacing + (this.allRows * this.dotRadius) + ((this.allRows - 1) * this.spacing);

        this.bounds = { x, y, width, height };
    }
}