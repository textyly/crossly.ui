import { CueCanvas } from "./cue.js";
import { ICueCanvasFacade } from "../types.js";
import { IInputCanvas } from "../../input/types.js";
import { CueCanvasConfig } from "../../../config/types.js";

export class CueCanvasFacade extends CueCanvas implements ICueCanvasFacade {
    constructor(config: CueCanvasConfig, input: IInputCanvas) {
        super(config, input);
    }

    public setThreadColor(color: string): void {
        this.threadColor = color;
        this.invokeThreadColorChange(this.threadColor);
        this.draw();
    }

    public setThreadWidth(width: number): void {
        this.threadWidth = width;
        this.invokeThreadWidthChange(this.threadWidth);
        this.draw();
    }
}