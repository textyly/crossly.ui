import assert from "../asserts/assert.js";
import { InputCanvas } from "./input/input.js";
import { IInputCanvas } from "./input/types.js";
import { ICrosslyCanvasFacade } from "./types.js";
import { CrosslyCanvasFacade } from "./facade.js";
import { CrosslyCanvasConfig } from "../config/types.js";
import { VectorDrawingCanvas } from "./drawing/vector/vector.js";
import { FabricRasterDrawingCanvas } from "./drawing/raster/fabric.js";
import { StitchRasterDrawingCanvas } from "./drawing/raster/stitch.js";
import { IRasterDrawingCanvas, IVectorDrawingCanvas } from "./drawing/types.js";

export class CrosslyCanvasBuilder {
    private config!: CrosslyCanvasConfig;
    private inputCanvas!: IInputCanvas;
    private fabricRasterDrawing!: IRasterDrawingCanvas;
    private stitchRasterDrawing!: IRasterDrawingCanvas;
    private cueVectorDrawing!: IVectorDrawingCanvas;

    public build(): ICrosslyCanvasFacade {
        assert.isDefined(this.config, "config");
        assert.isDefined(this.inputCanvas, "inputCanvas");
        assert.isDefined(this.fabricRasterDrawing, "fabricRasterDrawing");
        assert.isDefined(this.stitchRasterDrawing, "stitchRasterDrawing");
        assert.isDefined(this.cueVectorDrawing, "cueVectorDrawing");

        const crosslyCanvasFacade = new CrosslyCanvasFacade(
            this.config,
            this.inputCanvas,
            this.fabricRasterDrawing,
            this.stitchRasterDrawing,
            this.cueVectorDrawing);

        return crosslyCanvasFacade;
    }

    public withConfig(config: CrosslyCanvasConfig): CrosslyCanvasBuilder {
        this.config = config;
        assert.isDefined(this.config, "config");
        return this;
    }

    public withInputCanvas(inputElement: HTMLElement): CrosslyCanvasBuilder {
        assert.isDefined(this.config, "config");
        assert.isDefined(inputElement, "inputElement");
        this.inputCanvas = new InputCanvas(this.config.input, inputElement);
        return this;
    }

    public withFabricCanvas(fabricCanvasElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        assert.isDefined(fabricCanvasElement, "fabricCanvasElement");
        this.fabricRasterDrawing = new FabricRasterDrawingCanvas(fabricCanvasElement);
        return this;
    }

    public withStitchCanvas(stitchCanvasElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        assert.isDefined(stitchCanvasElement, "stitchCanvasElement");
        this.stitchRasterDrawing = new StitchRasterDrawingCanvas(stitchCanvasElement);
        return this;
    }

    public withCueCanvas(cueSvgElement: HTMLElement): CrosslyCanvasBuilder {
        assert.isDefined(cueSvgElement, "cueSvgElement");
        this.cueVectorDrawing = new VectorDrawingCanvas(cueSvgElement);
        return this;
    }
}