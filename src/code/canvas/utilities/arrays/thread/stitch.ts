import { ThreadBase } from "./thread.js";
import { IThreadPath } from "../types.js";
import { Dot, DotIndex } from "../../../types.js";

export class ThreadPath extends ThreadBase implements IThreadPath {
    private _zoomedWidth: number;

    private _indexesX: Int16Array;
    private _indexesY: Int16Array;
    private _visibilities: Array<boolean>;

    constructor(color: string, width: number) {
        super(color, width);

        this._zoomedWidth = super.width;

        this._indexesX = new Int16Array(this.space);
        this._indexesY = new Int16Array(this.space);
        this._visibilities = new Array<boolean>();
    }

    public get zoomedWidth(): number {
        return this._zoomedWidth;
    }

    public set zoomedWidth(value: number) {
        this._zoomedWidth = value;
    }

    public get indexesX(): Readonly<Int16Array> {
        return this._indexesX.slice(0, this.length);
    }

    public get indexesY(): Readonly<Int16Array> {
        return this._indexesY.slice(0, this.length);
    }

    public get visibilities(): Readonly<Array<boolean>> {
        return this._visibilities.slice(0, this.length);
    }

    public pushDotIndex(indexX: number, indexY: number): void {
        this.pushDot(indexX, indexY, 0, 0, false);
    }

    public pushDot(indexX: number, indexY: number, positionX: number, positionY: number, visible: boolean): void {
        super.push(positionX, positionY);

        this._indexesX[this.index] = indexX;
        this._indexesY[this.index] = indexY;
        this._visibilities[this.index] = visible;
    }

    public setDot(index: number, posX: number, posY: number, visible: boolean): void {
        super.set(index, posX, posY);
        this.setDotVisibility(index, visible);
    }

    public setDotVisibility(index: number, visible: boolean): void {
        this._visibilities[index] = visible;
    }

    public popDot(): (Dot & DotIndex) | undefined {
        const last = this.lastDot();
        super.pop();
        return last;
    }

    public lastDot(): (Dot & DotIndex) | undefined {
        if (this.length > 0) {
            const from = this.length - 1;
            const to = this.length;

            const indexX = this.indexesX.slice(from, to)[0];
            const indexY = this.indexesY.slice(from, to)[0];

            const pos = super.last()!;

            const dot = { dotX: indexX, dotY: indexY, ...pos };
            return dot;
        }
    }

    protected override expand(): void {
        super.expand();

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