import { StitchCanvas } from "./stitch.js";
import { IStitchCanvasFacade } from "../types.js";
import { StitchCanvasConfig } from "../../types.js";
import { IInputCanvas } from "../../input/types.js";

export class StitchCanvasFacade extends StitchCanvas implements IStitchCanvasFacade {
    constructor(config: StitchCanvasConfig, input: IInputCanvas) {
        super(config, input);
    }

    public setThreadColor(color: string): void {
        this.threadColor = color;
    }
}