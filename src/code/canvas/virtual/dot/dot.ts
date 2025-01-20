import { DotsConfig } from "../../types.js";
import { DotVirtualCanvasBase } from "./base.js";
import { IInputCanvas } from "../../input/types.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { Dot, DotsState, Id, IDotMatcher, IDotVirtualCanvas } from "../types.js";

export class DotVirtualCanvas extends DotVirtualCanvasBase implements IDotVirtualCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly dotMatcher: IDotMatcher;

    private readonly ids: IdGenerator;
    private readonly dots: Map<Id, Dot>;

    private dotsState!: DotsState;

    constructor(inputCanvas: IInputCanvas, dotMatcher: IDotMatcher) {
        super();

        this.inputCanvas = inputCanvas;
        this.dotMatcher = dotMatcher;

        this.dots = new Map();
        this.ids = new IdGenerator();

        this.subscribe();
    }

    public draw(config: Readonly<DotsConfig>): void {
        this.dotsState = config;
        this.redraw();
    }

    public getDotById(id: string): Dot | undefined {
        return this.dots.get(id);
    }

    public getDotByCoordinates(mouseX: number, mouseY: number): Dot | undefined {
        const dots = this.dots.values();

        for (const dot of dots) {
            const match = this.dotMatcher.match(mouseX, mouseY, dot.x, dot.y, dot.radius);
            if (match) {
                return dot;
            }
        }
    }

    private redraw(): void {
        this.recreateDots();
        this.recalculateSize();
        this.redrawDots();
    }

    private recreateDots(): void {
        this.clearState();

        const dotsY = this.dotsState.dotsY;
        const dotsX = this.dotsState.dotsX;

        for (let y = 0; y < dotsY; ++y) {
            for (let x = 0; x < dotsX; ++x) {
                const dot = this.crateDot(x, y);
                this.dots.set(dot.id, dot);
            }
        }
    }

    private crateDot(x: number, y: number): Dot {
        const id = this.ids.next();
        const spacing = this.dotsState.spacing.value;
        const radius = this.dotsState.radius.value;

        const x1 = (x * spacing) + spacing;
        const y1 = (y * spacing) + spacing;

        const dot = { id, x: x1, y: y1, radius };
        return dot;
    }

    private recalculateSize(): void {
        const dotsX = this.dotsState.dotsX;
        const dotsY = this.dotsState.dotsY;
        const spacing = this.dotsState.spacing.value;
        const radius = this.dotsState.radius.value;

        const width = spacing + (dotsX * radius) + ((dotsX - 1) * spacing);
        const height = spacing + (dotsY * radius) + ((dotsY - 1) * spacing);

        this.size = { width, height };
    }

    private redrawDots(): void {
        this.dots.forEach((dot) => super.invokeDrawDot(dot));
    }

    private clearState(): void {
        this.dots.clear();
        this.ids.reset();
    }

    private subscribe(): void {
        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);
    }

    private handleZoomIn(): void {
        if (this.dotsState) {
            this.dotsState.radius.value += this.dotsState.radius.step;
            this.dotsState.spacing.value += this.dotsState.spacing.step;
            this.redraw();
        }
    }

    private handleZoomOut(): void {
        if (this.dotsState) {
            this.dotsState.radius.value -= this.dotsState.radius.step;
            this.dotsState.spacing.value -= this.dotsState.spacing.step;
            this.redraw();
        }
    }
}