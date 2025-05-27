import { IAnimation } from "./types.js";
import { CrosslyCanvasAnimation } from "./animation.js";
import { CrosslyCanvasPattern, ICrosslyCanvasFacade } from "../canvas/types.js";

export class CrosslyCanvasAnimationFactory {
    public create(crosslyCanvas: ICrosslyCanvasFacade, pattern: CrosslyCanvasPattern): IAnimation {
        const animation = new CrosslyCanvasAnimation(crosslyCanvas, pattern);
        return animation;
    }
}