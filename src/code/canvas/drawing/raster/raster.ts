import { Bounds } from "../../types.js";
import { CanvasBase } from "../../base.js";
import assert from "../../../asserts/assert.js";

export abstract class RasterDrawingCanvas extends CanvasBase {
    protected readonly rasterCanvas: HTMLCanvasElement;
    protected readonly backRasterCanvas: HTMLCanvasElement;

    protected readonly rasterCanvasContext: CanvasRenderingContext2D;
    protected readonly backRasterCanvasContext: CanvasRenderingContext2D;

    protected readonly offset: number;

    constructor(
        className: string,
        rasterCanvas: HTMLCanvasElement,
        backRasterCanvas: HTMLCanvasElement) {

        super(className);

        this.rasterCanvas = rasterCanvas;
        this.backRasterCanvas = backRasterCanvas;

        this.rasterCanvasContext = this.rasterCanvas.getContext("2d")!;
        assert.defined(this.rasterCanvasContext, "rasterCanvasContext");

        this.backRasterCanvasContext = this.backRasterCanvas.getContext("2d")!;
        assert.defined(this.backRasterCanvasContext, "backRasterCanvasContext");

        this.offset = 5; // TODO: remove this hardcoded value
    }

    public override get bounds(): Bounds {
        return super.bounds;
    }

    public override set bounds(bounds: Bounds) {
        const copy = { ...bounds };
        copy.left -= this.offset;
        copy.top -= this.offset;
        copy.width += (this.offset * 2);
        copy.height += (this.offset * 2);
        super.bounds = copy;
    }

    public async createBitMap(): Promise<ImageBitmap> {
        const bitmap = await this.createBitMapCore(this.rasterCanvas);
        return bitmap;
    }

    public async createBackBitMap(): Promise<ImageBitmap> {
        const bitmap = await this.createBitMapCore(this.backRasterCanvas);
        return bitmap;
    }

    public drawBitMap(bitmap: ImageBitmap): void {
        this.drawBitMapCore(bitmap, this.rasterCanvasContext);
    }

    public drawBackBitMap(bitmap: ImageBitmap): void {
        this.drawBitMapCore(bitmap, this.backRasterCanvasContext);
    }

    public clear(): void {
        super.ensureAlive();

        const bounds = this.bounds;

        this.rasterCanvasContext.clearRect(0, 0, bounds.width, bounds.height);
        this.backRasterCanvasContext.clearRect(0, 0, bounds.width, bounds.height);
    }

    protected override invokeBoundsChange(bounds: Bounds): void {
        super.invokeBoundsChange(bounds);

        const x = bounds.left;
        const y = bounds.top;
        const width = bounds.width;
        const height = bounds.height;

        this.rasterCanvas.style.transform = `translate(${x}px, ${y}px)`;
        this.backRasterCanvas.style.transform = `translate(${x}px, ${y}px)`;

        if (width !== this.rasterCanvas.width || height !== this.rasterCanvas.height) {
            this.rasterCanvas.height = height;
            this.rasterCanvas.width = width;

            this.backRasterCanvas.height = height;
            this.backRasterCanvas.width = width;
        }
    }

    private async createBitMapCore(canvas: HTMLCanvasElement): Promise<ImageBitmap> {
        super.ensureAlive();

        const bitmap = await createImageBitmap(canvas);
        assert.defined(bitmap, "bitmap");

        return bitmap;
    }

    public drawBitMapCore(bitmap: ImageBitmap, canvasContext: CanvasRenderingContext2D): void {
        super.ensureAlive();

        const bounds = this.bounds;
        canvasContext.drawImage(bitmap, 0, 0, bounds.width, bounds.height);
    }
}