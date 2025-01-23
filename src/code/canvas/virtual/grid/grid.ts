import { GridCanvasBase } from "./base.js";
import { IInputCanvas, Position } from "../../input/types.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { Visibility, Id, GridDot, GridLine } from "../../types.js";
import { GridCanvasConfig, GridState, IDotMatcher, IGridCanvas } from "../types.js";

export class GridCanvas extends GridCanvasBase implements IGridCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly dotMatcher: IDotMatcher;

    private readonly ids: IdGenerator;
    private readonly dots: Map<Id, GridDot>;

    private state!: GridState;

    constructor(inputCanvas: IInputCanvas, dotMatcher: IDotMatcher) {
        super();

        this.inputCanvas = inputCanvas;
        this.dotMatcher = dotMatcher;

        this.ids = new IdGenerator();
        this.dots = new Map();

        this.subscribe();
    }

    public draw(config: Readonly<GridCanvasConfig>): void {
        this.state = config;

        // create space for the invisible rows and columns (of dots)
        this.state.dots.spacing.value = this.state.dots.spacing.value / 2;

        // add invisible rows (containing only invisible dots)
        const visibleRows = this.state.dots.rows;
        const invisibleRows = visibleRows - 1;
        this.state.dots.rows = visibleRows + invisibleRows;

        // add invisible columns (containing only invisible dots)
        const visibleColumns = this.state.dots.columns;
        const invisibleColumns = visibleColumns - 1;
        this.state.dots.columns = visibleColumns + invisibleColumns;

        this.redraw();
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

    private redraw(): void {
        this.recreateDots();
        this.recalculateSize();
        this.redrawDots();
        this.redrawLines();
    }

    private recreateDots(): void {
        this.ids.reset();
        this.dots.clear();

        for (let rowIdx = 0; rowIdx < this.state.dots.rows; ++rowIdx) {
            const dotsNumber = this.state.dots.columns;
            this.createRowDots(rowIdx, dotsNumber);
        }
    }

    private createRowDots(rowIdx: number, dotsNumber: number): void {
        const isVisibleRow = rowIdx % 2 == 0;
        if (isVisibleRow) {
            this.createDots(rowIdx, dotsNumber);
        } else {
            this.createInvisibleDots(rowIdx, dotsNumber);
        }
    }

    private createDots(rowIdx: number, dotsNumber: number): void {
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
        const id = this.ids.next();
        const spacing = this.state.dots.spacing.value;
        const radius = this.state.dots.radius.value;
        const color = this.state.dots.color;

        const x = (dotIdx * spacing) + spacing;
        const y = (rowIdx * spacing) + spacing;

        const dot = { id, x, y, radius, visibility, color };
        return dot;
    }

    private redrawDots(): void {
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

    private recalculateSize(): void {
        const dotsX = this.state.dots.columns;
        const dotsY = this.state.dots.rows;
        const spacing = this.state.dots.spacing.value;
        const radius = this.state.dots.radius.value;

        const width = spacing + (dotsX * radius) + ((dotsX - 1) * spacing);
        const height = spacing + (dotsY * radius) + ((dotsY - 1) * spacing);

        this.size = { width, height };
    }

    private redrawLines(): void {
        this.redrawColumnsLines();
        this.redrawRowsLines();
    }

    private redrawColumnsLines(): void {
        for (let columnIdx = 0; columnIdx < this.state.dots.columns; ++columnIdx) {
            const isVisibleColumn = columnIdx % 2 === 0;
            const visibility = isVisibleColumn ? Visibility.Visible : Visibility.Invisible;
            this.redrawColumnLine(columnIdx, visibility);
        }
    }

    private redrawColumnLine(columnIdx: number, visibility: Visibility): void {
        const fromDotId = columnIdx.toString();
        const fromDot = this.dots.get(fromDotId)!;

        const toDotId = this.state.dots.columns * (this.state.dots.rows - 1) + (columnIdx);
        const toStrDotId = toDotId.toString();
        const toDot = this.dots.get(toStrDotId)!;

        this.drawLine(fromDot, toDot, this.state.lines.width.value, visibility, this.state.lines.color);
    }

    private redrawRowsLines(): void {
        for (let rowIdx = 0; rowIdx < this.state.dots.rows; ++rowIdx) {
            const isVisibleColumn = rowIdx % 2 === 0;
            const visibility = isVisibleColumn ? Visibility.Visible : Visibility.Invisible;
            this.redrawRowLine(rowIdx, visibility);
        }
    }

    private redrawRowLine(rowIdx: number, visibility: Visibility): void {
        const fromDotId = rowIdx * this.state.dots.columns;
        const fromStrDotId = fromDotId.toString();
        const fromDot = this.dots.get(fromStrDotId)!;

        const toDotId = (rowIdx * this.state.dots.columns) + (this.state.dots.columns - 1);
        const toStrDotId = toDotId.toString();
        const toDot = this.dots.get(toStrDotId)!;

        this.drawLine(fromDot, toDot, this.state.lines.width.value, visibility, this.state.lines.color);
    }

    private drawLine(from: GridDot, to: GridDot, width: number, visibility: Visibility, color: string): void {
        const line = this.ensureLine(from, to, width, visibility, color);
        const isVisibleLine = line.visibility === Visibility.Visible;

        if (isVisibleLine) {
            super.invokeDrawVisibleLine(line);
        } else {
            super.invokeDrawInvisibleLine(line);
        }
    }

    private ensureLine(from: GridDot | undefined, to: GridDot | undefined, width: number, visibility: Visibility, color: string): GridLine {
        if (!from) {
            throw new Error("`from` dot must exist.");
        }

        if (!to) {
            throw new Error("`to` dot must exist.");
        }

        const line: GridLine = { from, to, width, visibility, color };
        return line;
    }

    private subscribe(): void {
        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);
    }

    private handleZoomIn(): void {
        if (this.state) {
            this.state.dots.radius.value += this.state.dots.radius.zoomStep;
            this.state.dots.spacing.value += this.state.dots.spacing.zoomStep;
            this.state.lines.width.value += this.state.lines.width.zoomStep;
            this.redraw();
        }
    }

    private handleZoomOut(): void {
        if (this.state) {
            this.state.dots.radius.value -= this.state.dots.radius.zoomStep;
            this.state.dots.spacing.value -= this.state.dots.spacing.zoomStep;
            this.state.lines.width.value -= this.state.lines.width.zoomStep;
            this.redraw();
        }
    }
}