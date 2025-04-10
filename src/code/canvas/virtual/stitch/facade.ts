import { StitchCanvas } from "./stitch.js";
import { IStitchCanvasFacade } from "../types.js";
import { IInputCanvas } from "../../input/types.js";
import { StitchCanvasConfig } from "../../../config/types.js";
import assert from "../../../asserts/assert.js";

export class StitchCanvasFacade extends StitchCanvas implements IStitchCanvasFacade {
    constructor(config: StitchCanvasConfig, input: IInputCanvas) {
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

    private setThreadCore(color: string, width: number): void {
        this.threadColor = color;
        this.invokeThreadColorChange(this.threadColor);

        this.threadWidth = width;
        this.invokeThreadWidthChange(this.threadWidth);

        this.createThread(this.threadColor, this.threadWidth);
    }
}