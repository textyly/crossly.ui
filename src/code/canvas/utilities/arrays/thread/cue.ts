import { ArrayBase } from "../base.js";
import { DotIndex } from "../../../types.js";

export class CueArray extends ArrayBase {
    private _clickedDotsXIndexes: Int16Array;
    private _clickedDotsYIndexes: Int16Array;
    private _widths: Int16Array;
    private _colors: Array<string>;

    constructor() {
        super();

        this._clickedDotsXIndexes = new Int16Array(this.space);
        this._clickedDotsYIndexes = new Int16Array(this.space);
        this._widths = new Int16Array(this.space);
        this._colors = new Array<string>();
    }

    public get clickedDotsXIndexes(): Readonly<Int16Array> {
        return this._clickedDotsXIndexes.slice(0, this.length);
    }

    public get clickedDotsYIndexes(): Readonly<Int16Array> {
        return this._clickedDotsYIndexes.slice(0, this.length);
    }

    public get widths(): Readonly<Int16Array> {
        return this._widths.slice(0, this.length);
    }

    public get colors(): Readonly<Array<string>> {
        return this._colors;
    }

    public push(clickedDotIdx: DotIndex, threadWidth: number, threadColor: string): void {
        super.occupyItemSpace();
        this._clickedDotsXIndexes[this.count] = clickedDotIdx.dotX;
        this._clickedDotsYIndexes[this.count] = clickedDotIdx.dotY;
        this._widths[this.count] = threadWidth;
        this._colors.push(threadColor);
    }

    // TODO: extract result in cue type
    public pop(): { clickedDotIdx: DotIndex, threadWidth: number, threadColor: string } | undefined {
        if (this.length <= 0) {
            return undefined;
        } else {
            const from = this.length - 1;
            const to = this.length;

            const clickedDotXIdx = this.clickedDotsXIndexes.slice(from, to)[0];
            const clickedDotYIdx = this.clickedDotsYIndexes.slice(from, to)[0];
            const threadWidth = this.widths.slice(from, to)[0];
            const threadColor = this._colors.pop()!;

            super.removeItemSpace();

            const cue = { clickedDotIdx: { dotX: clickedDotXIdx, dotY: clickedDotYIdx }, threadWidth, threadColor };
            return cue;
        }
    }

    public last(): { clickedDotIdx: DotIndex, threadWidth: number, threadColor: string } | undefined {
        if (this.length <= 0) {
            return undefined;
        } else {
            const from = this.length - 1;
            const to = this.length;

            const clickedDotXIdx = this.clickedDotsXIndexes.slice(from, to)[0];
            const clickedDotYIdx = this.clickedDotsYIndexes.slice(from, to)[0];
            const threadWidth = this.widths.slice(from, to)[0];
            const threadColor = this._colors.slice(from, to)[0]!;

            const cue = { clickedDotIdx: { dotX: clickedDotXIdx, dotY: clickedDotYIdx }, threadWidth, threadColor };
            return cue;
        }
    }

    protected override expand(): void {
        this.expandFromDotsXIndexes();
        this.expandFromDotsYIndexes();
        this.expandWidths();
    }

    private expandFromDotsXIndexes(): void {
        const fromDotsXIndexes = this._clickedDotsXIndexes;
        this._clickedDotsXIndexes = new Int16Array(this.space);

        for (let index = 0; index < fromDotsXIndexes.length; index++) {
            this._clickedDotsXIndexes[index] = fromDotsXIndexes[index];
        }
    }

    private expandFromDotsYIndexes(): void {
        const fromDotsYIndexes = this._clickedDotsYIndexes;
        this._clickedDotsYIndexes = new Int16Array(this.space);

        for (let index = 0; index < fromDotsYIndexes.length; index++) {
            this._clickedDotsYIndexes[index] = fromDotsYIndexes[index];
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