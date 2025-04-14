import { Cue } from "../types.js";
import { ArrayBase } from "../base.js";
import { DotIndex } from "../../../types.js";

export class CueThread extends ArrayBase {
    private _indexesX: Int16Array;
    private _indexesY: Int16Array;
    private _widths: Int16Array;
    private _colors: Array<string>;

    constructor() {
        super();

        this._indexesX = new Int16Array(this.space);
        this._indexesY = new Int16Array(this.space);
        this._widths = new Int16Array(this.space);
        this._colors = new Array<string>();
    }

    public get indexesX(): Readonly<Int16Array> {
        return this._indexesX.slice(0, this.length);
    }

    public get indexesY(): Readonly<Int16Array> {
        return this._indexesY.slice(0, this.length);
    }

    public get widths(): Readonly<Int16Array> {
        return this._widths.slice(0, this.length);
    }

    public get colors(): Readonly<Array<string>> {
        return this._colors;
    }

    public push(indexX: number, indexY: number, width: number, color: string): void {
        super.occupyItemSpace();

        this._indexesX[this.index] = indexX;
        this._indexesY[this.index] = indexY;
        this._widths[this.index] = width;
        this._colors.push(color);
    }

    public pop(): Cue | undefined {
        if (this.length > 0) {
            const last = this.last()!;
            super.removeItemSpace();
            return last;
        }
    }

    public last(): Cue | undefined {
        if (this.length > 0) {
            const from = this.length - 1;
            const to = this.length;

            const clickedDotXIdx = this.indexesX.slice(from, to)[0];
            const clickedDotYIdx = this.indexesY.slice(from, to)[0];
            const threadWidth = this.widths.slice(from, to)[0];
            const threadColor = this._colors.slice(from, to)[0]!;

            const cue = { clickedDotIdx: { dotX: clickedDotXIdx, dotY: clickedDotYIdx }, threadWidth, threadColor };
            return cue;
        }
    }

    protected override expand(): void {
        this.expandIndexesX();
        this.expandIndexesY();
        this.expandWidths();
    }

    private expandIndexesX(): void {
        const indexesX = this._indexesX;
        this._indexesX = new Int16Array(this.space);

        for (let index = 0; index < indexesX.length; index++) {
            this._indexesX[index] = indexesX[index];
        }
    }

    private expandIndexesY(): void {
        const indexesY = this._indexesY;
        this._indexesY = new Int16Array(this.space);

        for (let index = 0; index < indexesY.length; index++) {
            this._indexesY[index] = indexesY[index];
        }
    }

    private expandWidths(): void {
        const widths = this._widths;
        this._widths = new Int16Array(this.space);

        for (let index = 0; index < widths.length; index++) {
            this._widths[index] = widths[index];
        }
    }
}