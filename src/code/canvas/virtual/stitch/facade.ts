import { StitchCanvasBase } from "./base.js";
import { IStitchCanvasFacade } from "../types.js";
import { CanvasConfig } from "../../types.js";
import { IInputCanvas } from "../../input/types.js";

export abstract class StitchCanvasFacade extends StitchCanvasBase implements IStitchCanvasFacade {
    constructor(config: CanvasConfig, input: IInputCanvas) {
        super(config, input);
    }

    public setThreadColor(color: string): void {
        this.threadColor = color;
    }
}