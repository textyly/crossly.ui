import { Size } from "../../types.js";
import { DotVirtualCanvasBase } from "./base.js";
import { IInputCanvas } from "../../input/types.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { Dot, DotsConfig, Id, IDotVirtualCanvas } from "../types.js";

export class DotVirtualCanvas extends DotVirtualCanvasBase implements IDotVirtualCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly ids: IdGenerator;
    private readonly dots: Map<Id, Dot>;

    private dotsX!: number;
    private dotsY!: number;

    private radius!: number;
    private radiusStep!: number;

    private spacing!: number;
    private spacingStep!: number;

    constructor(inputCanvas: IInputCanvas) {
        super();

        this.inputCanvas = inputCanvas;

        this.dots = new Map();
        this.ids = new IdGenerator();

        this.subscribe();
    }

    public draw(config: DotsConfig): void {
        this.dotsX = config.x;
        this.dotsY = config.y;

        this.radius = config.radius.value;
        this.radiusStep = config.radius.step;

        this.spacing = config.spacing.value;
        this.spacingStep = config.spacing.step;

        this.drawDots();
    }

    public getDotByCoordinates(x: number, y: number): Dot | undefined {
        // TODO: try to find a better algorithm
        for (const dotKvp of this.dots) {
            const dot = dotKvp[1];
            const distance = Math.sqrt((x - dot.x) ** 2 + (y - dot.y) ** 2);
            let isInside = distance <= dot.radius;
            if (isInside) {
                return dot;
            }
        }
    }

    public getDotById(id: string): Dot | undefined {
        return this.dots.get(id);
    }

    private createDots(): void {
        this.dots.clear();
        this.ids.reset();

        for (let y = 0; y < this.dotsY; ++y) {
            for (let x = 0; x < this.dotsX; ++x) {
                const id = this.ids.next();

                // TODO: !!!
                const x1 = (x * this.spacing) + this.spacing;
                const y1 = (y * this.spacing) + this.spacing;
                const dot = { id, x: x1, y: y1, radius: this.radius };
                this.dots.set(id, dot);
            }
        }
    }

    private drawDots(): void {
        this.createDots();

        const newSize = this.calculateSize();
        this.size = newSize;

        this.dots.forEach((dot) => super.invokeDrawDot(dot));
    }

    private calculateSize(): Size {
        const width = this.spacing + (this.dotsX * this.radius) + ((this.dotsX - 1) * this.spacing);
        const height = this.spacing + (this.dotsY * this.radius) + ((this.dotsY - 1) * this.spacing);
        const size = { width, height };
        return size;
    }

    private subscribe(): void {
        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);
    }

    private handleZoomIn(): void {
        this.radius += this.radiusStep;
        this.spacing += this.spacingStep;
        this.drawDots();
    }

    private handleZoomOut(): void {
        this.radius -= this.radiusStep;
        this.spacing -= this.spacingStep;
        this.drawDots();
    }
}