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

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
        super.invokeChangeName(this._name);
    }

    public get config(): CrosslyCanvasConfig {
        return this.configuration;
    }

    public get fabricPattern(): FabricPattern {
        return this.fabricCanvasFacade.pattern;
    }

    public get stitchPattern(): StitchPattern {
        return this.stitchCanvasFacade.pattern;
    }

    public get cuePattern(): CuePattern {
        return this.cueCanvasFacade.pattern;
    }

    public draw(): void {
        this.ensureAlive();

        this.fabricCanvasFacade.draw();
        this.stitchCanvasFacade.draw();
        this.cueCanvasFacade.draw();
    }

    public load(pattern: CrosslyCanvasPattern): void {
        throw new Error("");
    }

    public useThread(color: string, width: number): void {
        this.stitchCanvasFacade.useThread(color, width);
        this.cueCanvasFacade.useThread(color, width);
    }
}