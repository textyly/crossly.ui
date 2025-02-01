import { GridCanvasBase } from "./base.js";
import { IDotMatcher, IGridCanvas } from "../types.js";
import { DotsUtility } from "../../../utilities/dots.js";
import { IInputCanvas, Position } from "../../input/types.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { Visibility, Id, GridDot, GridThread, GridCanvasConfig, Bounds } from "../../types.js";

export class GridCanvas extends GridCanvasBase implements IGridCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly dotMatcher: IDotMatcher;
    private readonly dotsUtility: DotsUtility<GridDot>;

    private readonly threadIds: IdGenerator;
    private readonly dotsIds: IdGenerator;
    private readonly dots: Map<Id, GridDot>;

    private pointerDownHeldPosition?: Position;
    private isPointerDownHeld: boolean;

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

        this.dots = new Map();
        this.dotsIds = new IdGenerator();
        this.threadIds = new IdGenerator();
        this.dotsUtility = new DotsUtility();

        this.isPointerDownHeld = false;

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

    public getDotById(id: string): GridDot | undefined {
        return this.dots.get(id);
    }

    public getDotByPosition(position: Position): GridDot | undefined {
        let match: GridDot | undefined = undefined;
        const dots = this.dots.values();

        for (const dot of dots) {

            const hasMatch = this.dotMatcher.match(dot, position, this._dotMatchDistance);
            if (hasMatch) {
                match = dot;
                break;
            }
        }

        return match;
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

        this.inputCanvas.onPointerDown(() => {
            this.isPointerDownHeld = true;
        });

        this.inputCanvas.onPointerUp(() => {
            this.isPointerDownHeld = false;
            this.pointerDownHeldPosition = undefined;
        });

        this.inputCanvas.onPointerMove((event) => {
            if (this.isPointerDownHeld) {
                const position = event.position;

                if (this.pointerDownHeldPosition) {
                    const diffX = position.x - this.pointerDownHeldPosition.x;
                    const diffY = position.y - this.pointerDownHeldPosition.y;

                    const x = this.bounds.x + diffX;
                    const y = this.bounds.y + diffY;
                    const width = this.bounds.width;
                    const height = this.bounds.height;

                    const bounds = { x, y, width, height };

                    super.bounds = bounds;
                    this.draw();
                }


                this.pointerDownHeldPosition = position;

            }
        });
    }

    private redraw(): void {
        this.calculateBounds();
        this.createDots();
        this.createAndDrawThreads();
        this.drawDots();
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

    private createDots(): void {
        this.dotsIds.reset();
        this.dots.clear();

        for (let rowIdx = 0; rowIdx < this.allRows; ++rowIdx) {
            this.createRowDots(rowIdx, this.allColumns);
        }
    }

    private createRowDots(rowIdx: number, dotsNumber: number): void {
        const isVisibleRow = rowIdx % 2 == 0;
        if (isVisibleRow) {
            this.createVisibleDots(rowIdx, dotsNumber);
        } else {
            this.createInvisibleDots(rowIdx, dotsNumber);
        }
    }

    private createVisibleDots(rowIdx: number, dotsNumber: number): void {
        for (let dotIdx = 0; dotIdx < dotsNumber; ++dotIdx) {
            const isVisibleDot = dotIdx % 2 == 0 ? Visibility.Visible : Visibility.Invisible;
            const dot = this.crateDot(dotIdx, rowIdx, isVisibleDot);
            this.dots.set(dot.id, dot);
        }
    }

    private createInvisibleDots(rowIdx: number, dotsNumber: number): void {
        for (let dotIdx = 0; dotIdx < dotsNumber; ++dotIdx) {
            const dot = this.crateDot(dotIdx, rowIdx, Visibility.Invisible);
            this.dots.set(dot.id, dot);
        }
    }

    private crateDot(dotIdx: number, rowIdx: number, visibility: Visibility): GridDot {
        const x = this.bounds.x + (dotIdx * this.spacing);
        const y = this.bounds.y + (rowIdx * this.spacing);

        const id = this.dotsIds.next();
        const dot = { id, x, y, radius: this.dotRadius, visibility, color: this.dotColor };
        return dot;
    }

    private drawDots(): void {
        const allDots = [...this.dots.values()];

        const visibleDots = allDots.filter((d) => d.visibility === Visibility.Visible);
        super.invokeDrawVisibleDots(visibleDots);

        const invisibleDots = allDots.filter((d) => d.visibility === Visibility.Invisible);
        super.invokeDrawInvisibleDots(invisibleDots);
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
        const fromDotId = columnIdx.toString();
        const fromDot = this.dots.get(fromDotId)!;

        const toDotId = this.allColumns * (this.allRows - 1) + (columnIdx);
        const toStrDotId = toDotId.toString();
        const toDot = this.dots.get(toStrDotId)!;

        const id = this.threadIds.next();
        const dots = this.dotsUtility.ensureDots(fromDot, toDot);

        const thread = { id, from: dots.from, to: dots.to, width: this.threadWidth, visibility, color: this.threadColor }
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
        const fromStrDotId = fromDotId.toString();
        const fromDot = this.dots.get(fromStrDotId)!;

        const toDotId = (rowIdx * this.allColumns) + (this.allColumns - 1);
        const toStrDotId = toDotId.toString();
        const toDot = this.dots.get(toStrDotId)!;

        const id = this.threadIds.next();
        const dots = this.dotsUtility.ensureDots(fromDot, toDot);

        const thread = { id, from: dots.from, to: dots.to, width: this.threadWidth, visibility, color: this.threadColor }
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