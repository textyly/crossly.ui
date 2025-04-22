import { ArrayBase } from "../base.js";
import { Dot } from "../../../types.js";
import { IThreadPathArray } from "../types.js";

export abstract class ThreadBase extends ArrayBase implements IThreadPathArray {
    private readonly _color: string;
    private readonly _width: number;

    private _positionsX: Int32Array;
    private _positionsY: Int32Array;

    constructor(color: string, width: number) {
        super();

        this._color = color;
        this._width = width;

        this._positionsX = new Int32Array(this.space);
        this._positionsY = new Int32Array(this.space);
    }

    public get color(): string {
        return this._color;
    }

    public get width(): number {
        return this._width;
    }

    public get positionsX(): Readonly<Int32Array> {
        return this._positionsX.slice(0, this.length);
    }

    public get positionsY(): Readonly<Int32Array> {
        return this._positionsY.slice(0, this.length);
    }

    public push(x: number, y: number): void {
        super.occupyItemSpace();

        this._positionsX[this.index] = x;
        this._positionsY[this.index] = y;
    }

    public set(index: number, x: number, y: number): void {
        this._positionsX[index] = x;
        this._positionsY[index] = y;
    }

    public pop(): Dot | undefined {
        if (this.length > 0) {
            const last = this.last();
            super.removeItemSpace();
            return last;
        }
    }

    public last(): Dot | undefined {
        if (this.length > 0) {
            const from = this.length - 1;
            const to = this.length;

            const posX = this.positionsX.slice(from, to)[0];
            const posY = this.positionsY.slice(from, to)[0];

            const position = { x: posX, y: posY };
            return position;
        }
    }

    protected override expand(): void {
        this.expandPositionsX();
        this.expandPositionsY();
    }

    private expandPositionsX(): void {
        const positionsX = this._positionsX;
        this._positionsX = new Int32Array(this.space);

        for (let index = 0; index < positionsX.length; index++) {
            this._positionsX[index] = positionsX[index];
        }
    }

    private expandPositionsY(): void {
        const positionsY = this._positionsY;
        this._positionsY = new Int32Array(this.space);

        for (let index = 0; index < positionsY.length; index++) {
            this._positionsY[index] = positionsY[index];
        }
    }
}