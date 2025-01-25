import { GridCanvasBase } from "./base.js";
import { DotsUtility } from "../../../utilities/dots.js";
import { IInputCanvas, Position } from "../../input/types.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { Visibility, Id, GridDot, GridLine } from "../../types.js";
import { GridCanvasConfig, IDotMatcher, IGridCanvas } from "../types.js";

export class GridCanvas extends GridCanvasBase implements IGridCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly dotMatcher: IDotMatcher;
    private readonly dotsUtility: DotsUtility<GridDot>;

    private readonly ids: IdGenerator;
    private readonly dots: Map<Id, GridDot>;

    private _spacing!: number;
    private _spacingZoomStep!: number;

    private _visibleRows!: number;
    private _visibleColumns!: number;

    constructor(config: GridCanvasConfig, inputCanvas: IInputCanvas, dotMatcher: IDotMatcher) {
        super(config);

        this.inputCanvas = inputCanvas;
        this.dotMatcher = dotMatcher;
        this.dotsUtility = new DotsUtility();

        this.ids = new IdGenerator();
        this.dots = new Map();

        this._spacing = this.calculateSpacing(config.spacing.value);
        this._spacingZoomStep = config.spacing.zoomStep;

        this._visibleRows = config.rows;
        this._visibleColumns = config.columns;

        this.subscribe();
    }

    public get spacing(): number {
        return this._spacing;
    }

    public set spacing(value: number) {
        if (this._spacing !== value) {
            this._spacing = this.calculateSpacing(value);
            this.draw();
        }
    }

    public get spacingZoomStep(): number {
        return this.spacingZoomStep;
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
        this.createDots();
        this.calculateSize();
        this.drawLines();
        this.drawDots();
    }

    public getDotById(id: string): GridDot | undefined {
        return this.dots.get(id);
    }

    public getDotByPosition(position: Position): GridDot | undefined {
        const dots = this.dots.values();

        for (const dot of dots) {
            const match = this.dotMatcher.match(dot, position);
            if (match) {
                return dot;
            }
        }
    }

    private subscribe(): void {
        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);
    }

    private handleZoomIn(): void {
        this._spacing += this._spacingZoomStep;
        super.zoomIn();
    }

    private handleZoomOut(): void {
        this._spacing -= this._spacingZoomStep;
        super.zoomOut();
    }

    private createDots(): void {
        this.ids.reset();
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
        const x = (dotIdx * this.spacing) + this.spacing;
        const y = (rowIdx * this.spacing) + this.spacing;

        const id = this.ids.next();
        const dot = { id, x, y, radius: this.dotRadius, visibility, color: this.dotColor };
        return dot;
    }

    private drawDots(): void {
        this.dots.forEach((dot) => this.drawDot(dot));
    }

    private drawDot(dot: GridDot): void {
        const isVisibleDot = dot.visibility === Visibility.Visible;

        if (isVisibleDot) {
            super.invokeDrawVisibleDot(dot);
        } else {
            super.invokeDrawInvisibleDot(dot);
        }
    }

    private drawLines(): void {
        this.drawColumnsLines();
        this.drawRowsLines();
    }

    private drawColumnsLines(): void {
        for (let columnIdx = 0; columnIdx < this.allColumns; ++columnIdx) {
            const isVisibleColumn = columnIdx % 2 === 0;
            const visibility = isVisibleColumn ? Visibility.Visible : Visibility.Invisible;
            this.drawColumnLine(columnIdx, visibility);
        }
    }

    private drawColumnLine(columnIdx: number, visibility: Visibility): void {
        const fromDotId = columnIdx.toString();
        const fromDot = this.dots.get(fromDotId)!;

        const toDotId = this.allColumns * (this.allRows - 1) + (columnIdx);
        const toStrDotId = toDotId.toString();
        const toDot = this.dots.get(toStrDotId)!;

        const dots = this.dotsUtility.ensureDots(fromDot, toDot);
        const line = { from: dots.from, to: dots.to, width: this.lineWidth, visibility, color: this.lineColor }
        this.drawLine(line);
    }

    private drawRowsLines(): void {
        for (let rowIdx = 0; rowIdx < this.allRows; ++rowIdx) {
            const isVisibleColumn = rowIdx % 2 === 0;
            const visibility = isVisibleColumn ? Visibility.Visible : Visibility.Invisible;
            this.drawRowLine(rowIdx, visibility);
        }
    }

    private drawRowLine(rowIdx: number, visibility: Visibility): void {
        const fromDotId = rowIdx * this.allColumns;
        const fromStrDotId = fromDotId.toString();
        const fromDot = this.dots.get(fromStrDotId)!;

        const toDotId = (rowIdx * this.allColumns) + (this.allColumns - 1);
        const toStrDotId = toDotId.toString();
        const toDot = this.dots.get(toStrDotId)!;

        const dots = this.dotsUtility.ensureDots(fromDot, toDot);
        const line = { from: dots.from, to: dots.to, width: this.lineWidth, visibility, color: this.lineColor }
        this.drawLine(line);
    }

    private drawLine(line: GridLine): void {
        const isVisibleLine = line.visibility === Visibility.Visible;
        if (isVisibleLine) {
            super.invokeDrawVisibleLine(line);
        } else {
            super.invokeDrawInvisibleLine(line);
        }
    }

    private calculateSpacing(value: number): number {
        // create space for the invisible rows and columns (of dots)
        const spacing = value / 2;
        return spacing;
    }

    private calculateSize(): void {
        // TODO: check this calculations
        const width = this.spacing + (this.allColumns * this.dotRadius) + ((this.allColumns - 1) * this.spacing);
        const height = this.spacing + (this.allRows * this.dotRadius) + ((this.allRows - 1) * this.spacing);

        this.size = { width, height };
    }
}