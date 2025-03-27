import { StitchCanvas } from "./stitch.js";
import { IStitchCanvasFacade } from "../types.js";
import { IInputCanvas } from "../../input/types.js";
import { StitchCanvasConfig } from "../../../config/types.js";
import assert from "../../../asserts/assert.js";

export class StitchCanvasFacade extends StitchCanvas implements IStitchCanvasFacade {
    constructor(config: StitchCanvasConfig, input: IInputCanvas) {
        super(config, input);
    }

    public setThread(color: string, width: number): void {
        assert.isDefined(color, "color");
        assert.that(color.length > 0, `color length must be bigger than 0 but it is ${color}`);

        assert.isDefined(width, "width");
        assert.that(width > 0, `width must be bigger than 0 but it is ${width}`);

        this.setThreadCore(color, width);
    }

    public setThreadColor(color: string): void {
        this.setThread(color, this.threadWidth);
    }

    public setThreadWidth(width: number): void {
        this.setThread(this.threadColor, width);
    }

    private setThreadCore(color: string, width: number): void {
        this.currentId = this.ids.next();

        this.threadColor = color;
        this.invokeThreadColorChange(this.threadColor);

        this.threadWidth = width;
        this.invokeThreadWidthChange(this.threadWidth);
    }
}