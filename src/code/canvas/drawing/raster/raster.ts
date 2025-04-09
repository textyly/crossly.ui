import { Bounds } from "../../types.js";
import { CanvasBase } from "../../base.js";
import assert from "../../../asserts/assert.js";

export abstract class RasterDrawingCanvas extends CanvasBase {
    protected readonly rasterCanvas: HTMLCanvasElement
    protected readonly context: CanvasRenderingContext2D;

    constructor(rasterCanvas: HTMLCanvasElement) {
        super();
        this.rasterCanvas = rasterCanvas;
        assert.defined(this.rasterCanvas, "HTMLCanvasElement");

        this.context = this.rasterCanvas.getContext("2d")!;
        assert.defined(this.context, "context");
    }

    public async createBitMap(): Promise<ImageBitmap> {
        super.ensureAlive();

        const bitmap = await createImageBitmap(this.rasterCanvas);
        assert.defined(bitmap, "bitmap");

        return bitmap;
    }

    public drawBitMap(bitmap: ImageBitmap): void {
        super.ensureAlive();
        assert.defined(bitmap, "bitmap");

        const bounds = this.bounds;
        this.context.drawImage(bitmap, 0, 0, bounds.width, bounds.height);
    }

    public clear(): void {
        super.ensureAlive();

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
}