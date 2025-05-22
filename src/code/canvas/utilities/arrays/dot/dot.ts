import { ArrayBase } from "../base.js";
import { IDotArray } from "../types.js";

export class DotArray extends ArrayBase implements IDotArray {
    private readonly _color: string;
    private readonly _radius: number;

    private _positionsX: Int32Array;
    private _positionsY: Int32Array;

    constructor(color: string, radius: number) {
        super();

        this._color = color;
        this._radius = radius;

        this._positionsX = new Int32Array(this.space);
        this._positionsY = new Int32Array(this.space);
    }

    public get color(): string {
        return this._color;
    }

    public get radius(): number {
        return this._radius;
    }

    public get positionsX(): Readonly<Int32Array> {
        return this._positionsX.slice(0, this.length);
    }

    public get positionsY(): Readonly<Int32Array> {
        return this._positionsY.slice(0, this.length);
    }

    public push(x: number, y: number): void {
        this.occupyItemSpace();

        this._positionsX[this.index] = x;
        this._positionsY[this.index] = y;
    }

    public clear(): void {
        this._positionsX = new Int32Array(0);
        this._positionsY = new Int32Array(0);
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