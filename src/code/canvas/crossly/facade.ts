import { CrosslyCanvas } from "./crossly.js";
import { IInputCanvas } from "../input/types.js";
import { CrosslyCanvasConfig } from "../../config/types.js";
import { IFabricRasterDrawingCanvas, IStitchRasterDrawingCanvas, IVectorDrawingCanvas } from "../drawing/types.js";
import { CrosslyCanvasPattern, CuePattern, FabricPattern, ICrosslyCanvasFacade, StitchPattern } from "../types.js";

export class CrosslyCanvasFacade extends CrosslyCanvas implements ICrosslyCanvasFacade {
    constructor(
        name: string,
        config: CrosslyCanvasConfig,
        inputCanvas: IInputCanvas,
        fabricRasterDrawing: IFabricRasterDrawingCanvas,
        stitchRasterDrawing: IStitchRasterDrawingCanvas,
        cueVectorDrawing: IVectorDrawingCanvas) {

        super(name, config, inputCanvas, fabricRasterDrawing, stitchRasterDrawing, cueVectorDrawing);
    }

    public get config(): CrosslyCanvasConfig {
        this.ensureAlive();
        return this.configuration;
    }

    public get name(): string {
        this.ensureAlive();
        return this._name;
    }

    public set name(value: string) {
        this.ensureAlive();

        this._name = value;
        super.invokeChangeName(this._name);
    }

    public get fabricPattern(): FabricPattern {
        this.ensureAlive();
        return this.fabricCanvasFacade.pattern;
    }

    public get stitchPattern(): StitchPattern {
        this.ensureAlive();
        return this.stitchCanvasFacade.pattern;
    }

    public get cuePattern(): CuePattern {
        this.ensureAlive();
        return this.cueCanvasFacade.pattern;
    }

    public draw(): void {
        this.ensureAlive();

        this.fabricCanvasFacade.draw();
        this.stitchCanvasFacade.draw();
        this.cueCanvasFacade.draw();
    }

    public load(pattern: CrosslyCanvasPattern): void {
        this.ensureAlive();

        this.fabricCanvasFacade.load(pattern.fabricPattern);
        this.stitchCanvasFacade.load(pattern.stitchPattern);
        this.cueCanvasFacade.load(pattern.stitchPattern);
    }

    public useThread(name: string, color: string, width: number): void {
        this.ensureAlive();

        this.stitchCanvasFacade.useThread(name, color, width);
        this.cueCanvasFacade.useThread(name, color, width);
    }
} 