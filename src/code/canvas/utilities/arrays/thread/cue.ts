import { ArrayBase } from "../base.js";
import { DotIndex } from "../../../types.js";
import { ICueThreadPath } from "../types.js";

export class CueThreadPath extends ArrayBase implements ICueThreadPath {
    private readonly _color: string;
    private readonly _width: number;

    private _indexesX: Int16Array;
    private _indexesY: Int16Array;

    constructor(color: string, width: number) {
        super();

        this._color = color;
        this._width = width;

        this._indexesX = new Int16Array(this.space);
        this._indexesY = new Int16Array(this.space);
    }

    public get color(): string {
        return this._color;
    }

    public get width(): number {
        return this._width;
    }

    public get indexesX(): Readonly<Int16Array> {
        return this._indexesX.slice(0, this.length);
    }

    public get indexesY(): Readonly<Int16Array> {
        return this._indexesY.slice(0, this.length);
    }

    public pushDotIndex(indexX: number, indexY: number): void {
        super.occupyItemSpace();

        this._indexesX[this.index] = indexX;
        this._indexesY[this.index] = indexY;
    }

    public popDotIndex(): DotIndex | undefined {
        if (this.length > 0) {
            const last = this.lastDotIndex();
            super.removeItemSpace();
            return last;
        }
    }

    public lastDotIndex(): DotIndex | undefined {
        if (this.length > 0) {
            const from = this.length - 1;
            const to = this.length;

            const indexX = this.indexesX.slice(from, to)[0];
            const indexY = this.indexesY.slice(from, to)[0];

            const dotIdx = { dotX: indexX, dotY: indexY };
            return dotIdx;
        }
    }

    public clear(): void {
        this._indexesX = new Int16Array(0);
        this._indexesY = new Int16Array(0);
    }

    protected override expand(): void {
        this.expandIndexesX();
        this.expandIndexesY();
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
}