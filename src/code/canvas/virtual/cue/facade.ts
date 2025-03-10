import { CueCanvasBase } from "./base.js";
import { CanvasConfig } from "../../types.js";
import { ICueCanvasFacade } from "../types.js";
import { IInputCanvas } from "../../input/types.js";

export abstract class CueCanvasFacade extends CueCanvasBase implements ICueCanvasFacade {
    constructor(config: CanvasConfig, input: IInputCanvas) {
        super(config, input);
    }

    public setThreadColor(color: string): void {
        this.threadColor = color;
        this.dotColor = color;
        this.draw();
    }
}