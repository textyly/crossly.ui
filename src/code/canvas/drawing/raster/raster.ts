import { Bounds } from "../../types.js";
import { CanvasBase } from "../../base.js";
import assert from "../../../asserts/assert.js";

export abstract class RasterDrawingCanvas extends CanvasBase {
    protected readonly rasterCanvas: HTMLCanvasElement;
    protected readonly rasterCanvasContext: CanvasRenderingContext2D;

    constructor(
        className: string,
        rasterCanvas: HTMLCanvasElement) {

        super(className);

        this.rasterCanvas = rasterCanvas;

        this.rasterCanvasContext = this.rasterCanvas.getContext("2d")!;
        assert.defined(this.rasterCanvasContext, "rasterCanvasContext");
    }

    public async createBitMap(): Promise<ImageBitmap> {
        super.ensureAlive();
        const bitmap = await this.createBitMapCore(this.rasterCanvas);
        return bitmap;
    }

    public drawBitMap(bitmap: ImageBitmap): void {
        super.ensureAlive();
        this.drawBitMapCore(bitmap, this.rasterCanvasContext);
    }

    public drawBackgroundColor(color: string): void {
        super.ensureAlive();

        this.rasterCanvasContext.fillStyle = color;
        this.rasterCanvasContext.fillRect(0, 0, this.bounds.width, this.bounds.height);
    }

    public clear(): void {
        super.ensureAlive();
        this.rasterCanvasContext.clearRect(0, 0, this.bounds.width, this.bounds.height);
    }

    protected override invokeBoundsChange(bounds: Bounds): void {
        super.ensureAlive();
        this.invokeBoundsChangeCore(bounds);
    }

    private async createBitMapCore(canvas: HTMLCanvasElement): Promise<ImageBitmap> {
        super.ensureAlive();

        const bitmap = await createImageBitmap(canvas);
        assert.defined(bitmap, "bitmap");

        return bitmap;
    }

    private drawBitMapCore(bitmap: ImageBitmap, canvasContext: CanvasRenderingContext2D): void {
        super.ensureAlive();

        canvasContext.drawImage(bitmap, 0, 0, this.bounds.width, this.bounds.height);
    }

    private invokeBoundsChangeCore(bounds: Bounds): void {
        super.invokeBoundsChange(bounds);

        const x = Math.round(bounds.left);
        const y = Math.round(bounds.top);
        const width = Math.round(bounds.width);
        const height = Math.round(bounds.height);

        this.rasterCanvas.style.transform = `translate(${x}px, ${y}px)`;

        if (width !== this.rasterCanvas.width || height !== this.rasterCanvas.height) {
            this.rasterCanvas.height = height;
            this.rasterCanvas.width = width;
        }
    }
}