import { CueCanvas } from "./cue.js";
import { ICueCanvasFacade } from "../types.js";
import assert from "../../../asserts/assert.js";
import { IInputCanvas } from "../../input/types.js";
import { CueCanvasConfig } from "../../../config/types.js";

export class CueCanvasFacade extends CueCanvas implements ICueCanvasFacade {
    constructor(config: CueCanvasConfig, input: IInputCanvas) {
        super(config, input);
    }

    public setThreadColor(color: string): void {
        this.setThread(color, this.threadWidth);
    }

    public setThreadWidth(width: number): void {
        this.setThread(this.threadColor, width);
    }

    public setThread(color: string, width: number): void {
        assert.defined(color, "color");
        assert.greaterThanZero(color.length, "color.length");

        assert.defined(width, "width");
        assert.greaterThanZero(width, "width");

        this.setThreadCore(color, width);
    }

    public cutThread(): void {
        super.cutThread();
        this.draw();
    }

    private setThreadCore(color: string, width: number): void {
        this.threadColor = color;
        this.threadWidth = width;

        this.cutThread();
    }
}