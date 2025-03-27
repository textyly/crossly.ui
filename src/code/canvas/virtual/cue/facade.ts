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
        assert.isDefined(color, "color");
        assert.that(color.length > 0, `color length must be bigger than 0 but it is ${color}`);

        assert.isDefined(width, "width");
        assert.that(width > 0, `width must be bigger than 0 but it is ${width}`);

        this.setThreadCore(color, width);
    }


    private setThreadCore(color: string, width: number): void {
        this.threadColor = color;
        this.threadWidth = width;
        this.draw();
    }
}