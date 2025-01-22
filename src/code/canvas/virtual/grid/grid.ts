import { GridCanvasBase } from "./base.js";
import { IInputCanvas, Position } from "../../input/types.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { Dot, CanvasConfig, DotVisibility, Id } from "../../types.js";
import { DotsState, IDotMatcher, IGridCanvas } from "../types.js";

export class GridCanvas extends GridCanvasBase implements IGridCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly dotMatcher: IDotMatcher;

    private readonly ids: IdGenerator;
    private readonly dots: Map<Id, Dot>;

    private state!: DotsState;

    constructor(inputCanvas: IInputCanvas, dotMatcher: IDotMatcher) {
        super();

        this.inputCanvas = inputCanvas;
        this.dotMatcher = dotMatcher;

        this.dots = new Map();
        this.ids = new IdGenerator();

        this.subscribe();
    }

    public draw(config: Readonly<CanvasConfig>): void {
        this.state = config;

        // create space for the invisible rows and columns (of dots)
        this.state.spacing.value = this.state.spacing.value / 2;

        // add invisible rows (containing only invisible dots)
        const visibleRows = this.state.rows;
        const invisibleRows = visibleRows - 1;
        this.state.rows = visibleRows + invisibleRows;

        // add invisible columns (containing only invisible dots)
        const visibleColumns = this.state.columns;
        const invisibleColumns = visibleColumns - 1;
        this.state.columns = visibleColumns + invisibleColumns;

        this.redraw();
    }

    public getDotById(id: string): Dot | undefined {
        return this.dots.get(id);
    }

    public getDotByPosition(mouse: Position): Dot | undefined {
        const dots = this.dots.values();

        for (const dot of dots) {
            const match = this.dotMatcher.match(dot, mouse);
            if (match) {
                return dot;
            }
        }
    }

    private redraw(): void {
        this.recreateDots();
        // TODO: recreateLines
        this.recalculateSize();
        this.redrawDots();
        // TODO: redrawLines
    }

    private recreateDots(): void {
        this.dots.clear();
        this.ids.reset();

        for (let row = 0; row < this.state.rows; ++row) {
            this.createRow(row);
        }
    }

    private createRow(row: number): void {
        const visible = row % 2 == 0;
        if (visible) {
            this.createVisibleRow(this.state.columns, row);
        } else {
            this.createInvisibleRow(this.state.columns, row);
        }
    }

    private createVisibleRow(columns: number, row: number): void {
        for (let column = 0; column < columns; ++column) {

            const visibility = column % 2 == 0
                ? DotVisibility.Visible
                : DotVisibility.Invisible;

            const dot = this.crateDot(column, row, visibility);
            this.dots.set(dot.id, dot);

            // TODO: create line for grid of lines
        }
    }

    private createInvisibleRow(rowDots: number, row: number): void {
        for (let x = 0; x < rowDots; ++x) {
            const dot = this.crateDot(x, row, DotVisibility.Invisible);
            this.dots.set(dot.id, dot);
        }
    }

    private crateDot(column: number, row: number, visibility: DotVisibility): Dot {
        const id = this.ids.next();
        const spacing = this.state.spacing.value;
        const radius = this.state.radius.value;

        const x = (column * spacing) + spacing;
        const y = (row * spacing) + spacing;

        const dot = { id, x, y, radius, visibility };
        return dot;
    }

    private recalculateSize(): void {
        const dotsX = this.state.columns;
        const dotsY = this.state.rows;
        const spacing = this.state.spacing.value;
        const radius = this.state.radius.value;

        const width = spacing + (dotsX * radius) + ((dotsX - 1) * spacing);
        const height = spacing + (dotsY * radius) + ((dotsY - 1) * spacing);

        this.size = { width, height };
    }

    private redrawDots(): void {
        this.dots.forEach((dot) => {
            if (dot.visibility === DotVisibility.Visible) {
                super.invokeDrawDot(dot);
            }
        });
    }

    private subscribe(): void {
        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);
    }

    private handleZoomIn(): void {
        if (this.state) {
            this.state.radius.value += this.state.radius.step;
            this.state.spacing.value += this.state.spacing.step;
            this.redraw();
        }
    }

    private handleZoomOut(): void {
        if (this.state) {
            this.state.radius.value -= this.state.radius.step;
            this.state.spacing.value -= this.state.spacing.step;
            this.redraw();
        }
    }
}