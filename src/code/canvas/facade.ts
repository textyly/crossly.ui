import { CrosslyCanvas } from "./crossly.js";
import { IInputCanvas } from "./input/types.js";
import { ICrosslyCanvasFacade } from "./types.js";
import { CrosslyCanvasConfig } from "../config/types.js";
import { IRasterDrawingCanvas, IVectorDrawingCanvas } from "./drawing/types.js";

export class CrosslyCanvasFacade extends CrosslyCanvas implements ICrosslyCanvasFacade {
    constructor(
        config: CrosslyCanvasConfig,
        inputCanvas: IInputCanvas,
        fabricRasterDrawing: IRasterDrawingCanvas,
        stitchRasterDrawing: IRasterDrawingCanvas,
        cueVectorDrawing: IVectorDrawingCanvas) {

        super(config, inputCanvas, fabricRasterDrawing, stitchRasterDrawing, cueVectorDrawing);
    }

    public setThreadColor(color: string): void {
        this.stitchCanvasFacade.setThreadColor(color);
        this.cueCanvasFacade.setThreadColor(color);
    }

    public setThreadWidth(width: number): void {
        this.stitchCanvasFacade.setThreadWidth(width);
        this.cueCanvasFacade.setThreadWidth(width);
    }

    // TODO: load patterns (stitches) must add stitch threads and cue threads as well!!! Otherwise `undo` logic will not work correctly.
}