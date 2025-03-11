import { Bounds } from "../types.js";
import { CanvasBase } from "../base.js";
import { IRasterDrawingCanvas } from "./types.js";
import { DotArray } from "../utilities/arrays/dot/dot.js";
import { ThreadArray } from "../utilities/arrays/thread/array.js";

export class RasterDrawingCanvas extends CanvasBase implements IRasterDrawingCanvas {
    private readonly endAngle: number;
    private readonly context: CanvasRenderingContext2D;

    constructor(private rasterCanvas: HTMLCanvasElement) {
        super();
        this.endAngle = Math.PI * 2;
        this.context = rasterCanvas.getContext("2d")!;
    }

    public async createBitMap(): Promise<ImageBitmap> {
        const bitmap = await createImageBitmap(this.rasterCanvas);
        return bitmap;
    }

    public drawBitMap(bitmap: ImageBitmap): void {
        const bounds = this.bounds;
        this.context.drawImage(bitmap, 0, 0, bounds.width, bounds.height);
    }

    public drawDots(dots: DotArray): void {
        const groups = this.createGroups(dots.length, dots.radiuses, dots.colors);
        this.drawDotsCore(dots, groups);
    }

    public drawLines(threads: ThreadArray): void {
        const groups = this.createGroups(threads.length, threads.widths, threads.colors);
        this.drawLinesCore(threads, groups);
    }

    public clear(): void {
        this.context.clearRect(0, 0, this.bounds.width, this.bounds.height);
    }

    protected override invokeBoundsChange(bounds: Bounds): void {
        super.invokeBoundsChange(bounds);

        const x = bounds.left;
        const y = bounds.top;
        const width = bounds.width;
        const height = bounds.height;

        this.rasterCanvas.style.transform = `translate(${x}px, ${y}px)`;

        if (width !== this.rasterCanvas.width || height !== this.rasterCanvas.height) {
            this.rasterCanvas.height = height;
            this.rasterCanvas.width = width;
        }
    }

    private drawDotsCore(dots: DotArray, groups: Map<string, Map<number, Array<number>>>): void {
        // CPU, GPU, memory and GC intensive code

        groups.forEach((radiuses, color) => {
            radiuses.forEach((dotIndexes, radius) => {
                this.context.beginPath();

                const dotsX = dots.dotsX;
                const dotsY = dots.dotsY;

                for (let index = 0; index < dotIndexes.length; index++) {
                    const dotIdX = dotIndexes[index];
                    const x = dotsX[dotIdX] - this.bounds.left;
                    const y = dotsY[dotIdX] - this.bounds.top;

                    this.context.fillStyle = color;
                    this.context.moveTo(x, y);
                    this.context.arc(x, y, radius, 0, this.endAngle);
                }

                this.context.fill();

            });
        });
    }

    private drawLinesCore(threads: ThreadArray, groups: Map<string, Map<number, Array<number>>>): void {
        // CPU, GPU, memory and GC intensive code, do not extract in multiple methods!!!

        groups.forEach((widths, color) => {
            widths.forEach((threadIndexes, width) => {
                this.context.beginPath();

                const visibility = threads.visibilities;
                const fromDotsXPositions = threads.fromDotsXPositions;
                const fromDotsYPositions = threads.fromDotsYPositions;
                const toDotsXPositions = threads.toDotsXPositions;
                const toDotsYPositions = threads.toDotsYPositions;

                for (let index = 0; index < threads.length; index++) {
                    const threadIdx = threadIndexes[index];
                    const isVisible = visibility[threadIdx];
                    if (!isVisible) {
                        continue;
                    }

                    const fromX = fromDotsXPositions[threadIdx] - this.bounds.left;
                    const fromY = fromDotsYPositions[threadIdx] - this.bounds.top;
                    const toX = toDotsXPositions[threadIdx] - this.bounds.left;
                    const toY = toDotsYPositions[threadIdx] - this.bounds.top;

                    const leg = Math.sqrt((width * width) / 2);


                    if (fromX < toX && fromY < toY) {
                        this.context.moveTo(fromX, fromY);
                        this.context.lineTo(fromX, fromY + leg);
                        this.context.lineTo(toX - leg, toY);
                        this.context.lineTo(toX, toY);
                        this.context.lineTo(toX, toY - leg);
                        this.context.lineTo(fromX + leg, fromY);
                        this.context.lineTo(fromX, fromY);
                    }

                    if (fromX > toX && fromY > toY) {
                        this.context.moveTo(toX, toY);
                        this.context.lineTo(toX, toY + leg);
                        this.context.lineTo(fromX - leg, fromY);
                        this.context.lineTo(fromX, fromY);
                        this.context.lineTo(fromX, fromY - leg);
                        this.context.lineTo(toX + leg, toY);
                        this.context.lineTo(toX, toY);
                    }

                    if (fromX > toX && fromY < toY) {
                        this.context.moveTo(fromX, fromY);
                        this.context.lineTo(fromX - leg, fromY);
                        this.context.lineTo(toX, toY - leg);
                        this.context.lineTo(toX, toY);
                        this.context.lineTo(toX + leg, toY);
                        this.context.lineTo(fromX, fromY + leg);
                        this.context.lineTo(fromX, fromY);
                    }

                    if (fromX < toX && fromY > toY) {
                        this.context.moveTo(toX, toY);
                        this.context.lineTo(toX - leg, toY);
                        this.context.lineTo(fromX, fromY - leg);
                        this.context.lineTo(fromX, fromY);
                        this.context.lineTo(fromX + leg, fromY);
                        this.context.lineTo(toX, toY + leg);
                        this.context.lineTo(toX, toY);
                    }

                    if (fromX < toX && fromY == toY) {
                        const l = Math.sqrt((leg * leg) / 2);
                        this.context.moveTo(fromX, fromY);
                        this.context.lineTo(fromX + l, fromY + l);
                        this.context.lineTo(toX - l, toY + l);
                        this.context.lineTo(toX, toY);
                        this.context.lineTo(toX - l, toY - l);
                        this.context.lineTo(fromX + l, fromY - l);
                        this.context.lineTo(fromX, fromY);
                    }

                    if (fromX > toX && fromY == toY) {
                        const l = Math.sqrt((leg * leg) / 2);
                        this.context.moveTo(fromX, fromY);
                        this.context.lineTo(fromX - l, fromY - l);
                        this.context.lineTo(toX + l, toY - l);
                        this.context.lineTo(toX, toY);
                        this.context.lineTo(toX + l, toY + l);
                        this.context.lineTo(fromX - l, fromY + l);
                        this.context.lineTo(fromX, fromY);
                    }

                    if (fromX == toX && fromY < toY) {
                        const l = Math.sqrt((leg * leg) / 2);
                        this.context.moveTo(fromX, fromY);
                        this.context.lineTo(fromX - l, fromY + l);
                        this.context.lineTo(toX - l, toY - l);
                        this.context.lineTo(toX, toY);
                        this.context.lineTo(toX + l, toY - l);
                        this.context.lineTo(fromX + l, fromY + l);
                        this.context.lineTo(fromX, fromY);
                    }

                    if (fromX == toX && fromY > toY) {
                        const l = Math.sqrt((leg * leg) / 2);
                        this.context.moveTo(fromX, fromY);
                        this.context.lineTo(fromX + l, fromY - l);
                        this.context.lineTo(toX + l, toY + l);
                        this.context.lineTo(toX, toY);
                        this.context.lineTo(toX - l, toY + l);
                        this.context.lineTo(fromX - l, fromY - l);
                        this.context.lineTo(fromX, fromY);
                    }
                }

                this.context.strokeStyle = color; // Border color
                this.context.lineWidth = 0.1;
                this.context.stroke();              // Draw the outline
                this.context.fillStyle = color; // Fill color
                this.context.fill();
                this.context.closePath();
            });
        });
    }

    private createGroups(length: number, widths: Readonly<Float32Array>, colors: Readonly<Array<string>>): Map<string, Map<number, Array<number>>> {

        const colorsGroup = new Map<string, Map<number, Array<number>>>();

        for (let index = 0; index < length; index++) {

            const color = colors[index];
            if (!colorsGroup.has(color)) {
                const widthsGroup = new Map<number, Array<number>>();
                colorsGroup.set(color, widthsGroup);
            }

            const width = widths[index];
            const widthsGroup = colorsGroup.get(color)!;
            if (!widthsGroup.has(width)) {
                widthsGroup.set(width, []);
            }

            const indexes = widthsGroup.get(width)!;
            indexes.push(index);
        }

        return colorsGroup;
    }
}