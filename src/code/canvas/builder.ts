import { CrosslyCanvas } from "./crossly.js";
import { InputCanvas } from "./input/input.js";
import { IInputCanvas } from "./input/types.js";
import { CueDrawingCanvas } from "./drawing/cue.js";
import { FabricDrawingCanvas } from "./drawing/fabric.js";
import { StitchRasterDrawingCanvas } from "./drawing/raster/stitch.js";
import { VectorDrawingCanvas } from "./drawing/vector.js";
import { StitchDrawingCanvas } from "./drawing/stitch.js";
import { CrosslyCanvasConfig, ICrosslyCanvas } from "./types.js";
import { ICueDrawingCanvas, IFabricDrawingCanvas, IRasterDrawingCanvas, IStitchDrawingCanvas, IVectorDrawingCanvas } from "./drawing/types.js";
import { FabricRasterDrawingCanvas } from "./drawing/raster/fabric.js";

export class CrosslyCanvasBuilder {
    private config!: CrosslyCanvasConfig;
    private inputCanvas!: IInputCanvas;
    private fabricRasterDrawing!: IRasterDrawingCanvas;
    private stitchRasterDrawing!: IRasterDrawingCanvas;
    private cueVectorDrawing!: IVectorDrawingCanvas;

    public build(): ICrosslyCanvas {
        const crosslyCanvas = new CrosslyCanvas(
            this.config,
            this.inputCanvas,
            this.fabricRasterDrawing,
            this.stitchRasterDrawing,
            this.cueVectorDrawing);

        return crosslyCanvas;
    }

    public withConfig(config: CrosslyCanvasConfig): CrosslyCanvasBuilder {
        this.config = config;
        return this;
    }

    public withInputCanvas(inputElement: HTMLElement): CrosslyCanvasBuilder {
        this.inputCanvas = new InputCanvas(inputElement);
        return this;
    }

    public withFabricCanvas(fabricCanvasElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        this.fabricRasterDrawing = new FabricRasterDrawingCanvas(fabricCanvasElement);
        return this;
    }

    public withStitchCanvas(stitchCanvasElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        this.stitchRasterDrawing = new StitchRasterDrawingCanvas(stitchCanvasElement);
        return this;
    }

    public withCueCanvas(cueSvgElement: HTMLElement): CrosslyCanvasBuilder {
        this.cueVectorDrawing = new VectorDrawingCanvas(cueSvgElement);
        return this;
    }
}