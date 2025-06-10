import { FabricCanvas } from "./fabric.js";
import { FabricPattern } from "../../types.js";
import { IFabricCanvasFacade } from "../types.js";
import { IInputCanvas } from "../../input/types.js";
import { FabricCanvasConfig } from "../../../config/types.js";

export class FabricCanvasFacade extends FabricCanvas implements IFabricCanvasFacade {

    constructor(config: FabricCanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);
    }

    public get name(): string {
        super.ensureAlive();
        return this._name;
    }

    public get color(): string {
        super.ensureAlive();
        return this._color;
    }

    public get rows(): number {
        super.ensureAlive();
        return this._rows;
    }

    public get columns(): number {
        super.ensureAlive();
        return this._columns;
    }

    public get dotsColor(): string {
        super.ensureAlive();
        return this._dotsColor;
    }

    public get threadsColor(): string {
        super.ensureAlive();
        return this._threadsColor;
    }

    public get pattern(): FabricPattern {
        super.ensureAlive();

        return {
            name: this.name,
            color: this.color,
            rows: this.rows,
            columns: this.columns,
            dots: { color: this.dotsColor },
            threads: { color: this.threadsColor }
        };
    }

    public load(pattern: FabricPattern): void {
        super.ensureAlive();
        super.loadPattern(pattern);
    }
}