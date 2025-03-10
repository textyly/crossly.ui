import { CueCanvas } from "./cue.js";
import { CanvasConfig } from "../../types.js";
import { ICueCanvasFacade } from "../types.js";
import { IInputCanvas } from "../../input/types.js";

export class CueCanvasFacade extends CueCanvas implements ICueCanvasFacade {
    constructor(config: CanvasConfig, input: IInputCanvas) {
        super(config, input);
    }

    public setThreadColor(color: string): void {
        this.threadColor = color;
        this.dotColor = color;
        this.draw();
    }
}