import { CrosslyCanvas } from "./crossly.js";
import { IInputCanvas } from "../input/types.js";
import { CrosslyCanvasConfig } from "../../config/types.js";
import { CrosslyCanvasPattern, DotIndex, ICrosslyCanvasFacade } from "../types.js";
import { IFabricRasterDrawingCanvas, IStitchRasterDrawingCanvas, IVectorDrawingCanvas } from "../drawing/types.js";

export class CrosslyCanvasFacade extends CrosslyCanvas implements ICrosslyCanvasFacade {
    constructor(
        config: CrosslyCanvasConfig,
        inputCanvas: IInputCanvas,
        frontFabricRasterDrawing: IFabricRasterDrawingCanvas,
        backFabricRasterDrawing: IFabricRasterDrawingCanvas,
        frontStitchRasterDrawing: IStitchRasterDrawingCanvas,
        backStitchRasterDrawing: IStitchRasterDrawingCanvas,
        frontCueVectorDrawing: IVectorDrawingCanvas,
        backCueVectorDrawing: IVectorDrawingCanvas) {

        super(
            config,
            inputCanvas,
            frontFabricRasterDrawing,
            backFabricRasterDrawing,
            frontStitchRasterDrawing,
            backStitchRasterDrawing,
            frontCueVectorDrawing,
            backCueVectorDrawing);
    }

    public get config(): CrosslyCanvasConfig {
        this.ensureAlive();
        return this.configuration;
    }

    public get pattern(): CrosslyCanvasPattern {
        this.ensureAlive();

        return {
            fabric: this.fabricCanvasFacade.pattern,
            stitch: this.stitchCanvasFacade.pattern
        };
    }

    public draw(): void {
        this.ensureAlive();

        this.fabricCanvasFacade.draw();
        this.stitchCanvasFacade.draw();
        this.cueCanvasFacade.draw();
    }

    public load(pattern: CrosslyCanvasPattern): void {
        this.ensureAlive();

        const newFabric = pattern.fabric;
        this.fabricCanvasFacade.load(pattern.fabric);
        this.stitchCanvasFacade.load(newFabric.columns, newFabric.rows, pattern.stitch);
        this.cueCanvasFacade.load(newFabric.columns, newFabric.rows, pattern.stitch);
    }

    public clickDot(dotIdx: DotIndex): void {
        this.ensureAlive();

        this.stitchCanvasFacade.clickDot(dotIdx);
        this.cueCanvasFacade.clickDot(dotIdx);
    }

    public useThread(name: string, color: string, width: number): void {
        this.ensureAlive();

        this.stitchCanvasFacade.useThread(name, color, width);
        this.cueCanvasFacade.useThread(name, color, width);
    }

    public undo(): void {
        this.ensureAlive();
        this.stitchCanvasFacade.undo();
        this.cueCanvasFacade.undo();
    }

    public redo(): void {
        this.ensureAlive();
        this.stitchCanvasFacade.redo();
        this.cueCanvasFacade.redo();
    }

    public zoomIn(): void {
        this.ensureAlive();

        this.fabricCanvasFacade.zoomIn();
        this.stitchCanvasFacade.zoomIn();
        this.cueCanvasFacade.zoomIn();

        this.draw();
    }

    public zoomOut(): void {
        this.ensureAlive();

        this.fabricCanvasFacade.zoomOut();
        this.stitchCanvasFacade.zoomOut();
        this.cueCanvasFacade.zoomOut();

        this.draw();
    }
} 