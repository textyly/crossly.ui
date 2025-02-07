import { GridCanvasBase } from "./base.js";
import { IDotMatcher, IGridCanvas } from "../types.js";
import { DotsUtility } from "../../../utilities/dots.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { IInputCanvas, MoveEvent, Position } from "../../input/types.js";
import { Visibility, GridDot, GridThread, GridCanvasConfig } from "../../types.js";

export class GridCanvas extends GridCanvasBase implements IGridCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly dotMatcher: IDotMatcher;
    private readonly dotsUtility: DotsUtility<{ x: number, y: number }>;

    private readonly dotsIds: IdGenerator
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

        this.dotsIds = new IdGenerator();
        this.threadIds = new IdGenerator();
        this.dotsUtility = new DotsUtility();

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

    public getDotById(id: number): GridDot | undefined {
        if (id) {
            const x = this.dotsX[id];
            const y = this.dotsY[id];
            return { id, x, y };
        }
        // const pos = this.dots.get(Number(id));
        // if (pos) {
        //     return { id, ...pos };
        // }
    }

    public getDotByPosition(position: Position): GridDot | undefined {

        for (let index = 0; index < this.dotsX.length; ++index) {
            const x = this.dotsX[index];
            const y = this.dotsY[index];

            const hasMatch = this.dotMatcher.match(x, y, position, this._dotMatchDistance);
            if (hasMatch) {
                return { id: index, x, y };
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
        this.createDots();
        //this.createAndDrawThreads();
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

    private createDots(): void {
        this.dotsX = [];
        this.dotsY = [];
        const visible: { id: number, x: number, y: number }[] = [];

        const bounds = this.bounds;
        const spacing = this.spacing;
        const allColumns = this.allColumns;

        for (let rowIdx = 0; rowIdx < this.allRows; ++rowIdx) {
            const isVisibleRow = rowIdx % 2 == 0;
            if (isVisibleRow) {
                for (let dotIdx = 0; dotIdx < allColumns; ++dotIdx) {
                    const visibility = dotIdx % 2 == 0 ? Visibility.Visible : Visibility.Invisible;
                    const x = bounds.x + (dotIdx * spacing);
                    const y = bounds.y + (rowIdx * spacing);

                    if (visibility === Visibility.Visible) {
                        const id = this.dotsX.length;
                        visible.push({ id, x, y });
                    }

                    this.dotsX.push(x);
                    this.dotsY.push(y);

                }
            } else {
                for (let dotIdx = 0; dotIdx < allColumns; ++dotIdx) {
                    const x = bounds.x + (dotIdx * spacing);
                    const y = bounds.y + (rowIdx * spacing);

                    this.dotsX.push(x);
                    this.dotsY.push(y);
                }
            }
        }


        super.invokeDrawVisibleDots(visible, this.dotRadius, this.dotColor);
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

    private createColumnThread(columnIdx: number, visibility: Visibility): GridThread {
        const fromDotId = columnIdx;
        const fromDot = undefined!; //this.dots.get(fromDotId)!;

        const toDotId = this.allColumns * (this.allRows - 1) + (columnIdx);
        const toDot = undefined!; //this.dots.get(toDotId)!;

        const id = this.threadIds.next();
        const dots = this.dotsUtility.ensureDots(fromDot, toDot);

        const f: GridDot = { id: fromDotId, ...dots.from };
        const t: GridDot = { id: toDotId, ...dots.to };

        const thread = { id, from: f, to: t, width: this.threadWidth, visibility, color: this.threadColor }
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
        const fromDotId = rowIdx * this.allColumns;
        const fromDot = undefined!; //this.dots.get(fromDotId)!;

        const toDotId = (rowIdx * this.allColumns) + (this.allColumns - 1);
        const toDot = undefined!; // this.dots.get(toDotId)!;

        const id = this.threadIds.next();
        const dots = this.dotsUtility.ensureDots(fromDot, toDot);


        const f: GridDot = { id: fromDotId, ...dots.from };
        const t: GridDot = { id: toDotId, ...dots.to };

        const thread = { id, from: f, to: t, width: this.threadWidth, visibility, color: this.threadColor }
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