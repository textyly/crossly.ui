import { ArrayBase } from "../base.js";
import { IFabricThreadArray } from "../types.js";

export class FabricThreadArray extends ArrayBase implements IFabricThreadArray {
    private readonly _color: string;
    private readonly _width: number;

    private _positionsX1: Int32Array;
    private _positionsY1: Int32Array;
    private _positionsX2: Int32Array;
    private _positionsY2: Int32Array;

    constructor(color: string, width: number) {
        super();

        this._color = color;
        this._width = width;

        this._positionsX1 = new Int32Array(this.space);
        this._positionsY1 = new Int32Array(this.space);
        this._positionsX2 = new Int32Array(this.space);
        this._positionsY2 = new Int32Array(this.space);
    }

    public get color(): string {
        return this._color;
    }

    public get width(): number {
        return this._width;
    }

    public get positionsX1(): Readonly<Int32Array> {
        return this._positionsX1.slice(0, this.length);
    }

    public get positionsY1(): Readonly<Int32Array> {
        return this._positionsY1.slice(0, this.length);
    }

    public get positionsX2(): Readonly<Int32Array> {
        return this._positionsX2.slice(0, this.length);
    }

    public get positionsY2(): Readonly<Int32Array> {
        return this._positionsY2.slice(0, this.length);
    }

    public push(x1: number, y1: number, x2: number, y2: number): void {
        super.occupyItemSpace();

        this._positionsX1[this.index] = x1;
        this._positionsY1[this.index] = y1;
        this._positionsX2[this.index] = x2;
        this._positionsY2[this.index] = y2;
    }

    protected override expand(): void {
        this.expandPositionsX1();
        this.expandPositionsY1();
        this.expandPositionsX2();
        this.expandPositionsY2();
    }

    private expandPositionsX1(): void {
        const positionsX1 = this._positionsX1;
        this._positionsX1 = new Int32Array(this.space);

        for (let index = 0; index < positionsX1.length; index++) {
            this._positionsX1[index] = positionsX1[index];
        }
    }

    private expandPositionsY1(): void {
        const positionsY1 = this._positionsY1;
        this._positionsY1 = new Int32Array(this.space);

        for (let index = 0; index < positionsY1.length; index++) {
            this._positionsY1[index] = positionsY1[index];
        }
    }

    private expandPositionsX2(): void {
        const positionsX2 = this._positionsX2;
        this._positionsX2 = new Int32Array(this.space);

        for (let index = 0; index < positionsX2.length; index++) {
            this._positionsX2[index] = positionsX2[index];
        }
    }

    private expandPositionsY2(): void {
        const positionsY2 = this._positionsY2;
        this._positionsY2 = new Int32Array(this.space);

        for (let index = 0; index < positionsY2.length; index++) {
            this._positionsY2[index] = positionsY2[index];
        }
    }
}