import assert from "../../asserts/assert.js";
import { Base } from "../../general/base.js";
import { Colors, IColorPalette } from "../types.js";

export class ColorPalette extends Base implements IColorPalette {
    private _buttons: Array<HTMLElement>;
    private activeColors: Array<string>;

    constructor(buttons: Array<HTMLElement>) {
        super(ColorPalette.name);
        assert.greaterThanZero(buttons?.length, "buttons.length");

        this._buttons = buttons;
        this.activeColors = this._buttons.map((button) => this.getButtonColor(button)).map((color) => this.normalizeColor(color));
    }

    public get buttons(): Array<HTMLElement> {
        return this._buttons;
    }

    public insert(colors: Colors): void {
        assert.greaterThanZero(colors?.length, "colors.length");

        let uniqueColors = this.getUniqueColors(colors);
        assert.greaterThanZero(uniqueColors.length, "uniqueColors.length");

        // TODO: incorrect algorithm!!!
        uniqueColors = uniqueColors.map((color) => this.normalizeColor(color));

        uniqueColors.forEach((color) => {
            const index = this.activeColors.indexOf(color);
            if (index > -1) {
                this.activeColors.splice(index, 1);
            }
        });

        const colorsToInsert = Math.min(uniqueColors.length, this._buttons.length);

        for (let index = 0; index < colorsToInsert; index++) {
            const colorToInsert = uniqueColors[index];
            this.activeColors = [colorToInsert, ...this.activeColors];
        }

        for (let index = 0; index < this._buttons.length; index++) {
            const color = this.activeColors[index];
            const button = this._buttons[index];
            button.style.backgroundColor = color;
        }

    }

    private getUniqueColors(colors: Array<string>): Array<string> {
        const unique = new Set<string>();

        colors.forEach((color) => {
            const has = unique.has(color);
            if (!has) {
                unique.add(color);
            }
        });

        return [...unique];
    }

    private getButtonColor(element: Element): string {
        return getComputedStyle(element).backgroundColor;
    }

    // TODO: this method must be invoked very rarely
    private normalizeColor(color: string) {
        const temp = document.createElement("div");
        temp.style.color = color;
        document.body.appendChild(temp);

        const computedColor = getComputedStyle(temp).color;
        document.body.removeChild(temp);
        return computedColor;
    }
}