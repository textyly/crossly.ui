import { CueCanvas } from "./cue.js";
import { ICueCanvasFacade } from "../types.js";
import { CueCanvasConfig } from "../../types.js";
import { IInputCanvas } from "../../input/types.js";

export class CueCanvasFacade extends CueCanvas implements ICueCanvasFacade {
    constructor(config: CueCanvasConfig, input: IInputCanvas) {
        super(config, input);
    }

    public setThreadColor(color: string): void {
        this.threadColor = color;
        this.draw();
    }
}