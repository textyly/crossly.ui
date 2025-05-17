import { FabricCanvas } from "./fabric.js";
import { FabricPattern } from "../../types.js";
import { IFabricCanvasFacade } from "../types.js";
import { IInputCanvas } from "../../input/types.js";
import { FabricCanvasConfig } from "../../../config/types.js";

export class FabricCanvasFacade extends FabricCanvas implements IFabricCanvasFacade {

    constructor(config: FabricCanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);
    }

    public get pattern(): FabricPattern {
            return this._pattern;
        }

    public load(pattern: FabricPattern): void {
        throw new Error("Method not implemented.");
    }
}