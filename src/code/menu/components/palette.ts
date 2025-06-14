import assert from "../../asserts/assert.js";
import { Base } from "../../general/base.js";
import { VoidUnsubscribe } from "../../types.js";
import { Messaging1 } from "../../messaging/impl.js";
import { IMessaging1 } from "../../messaging/types.js";
import { ChangeThreadEvent, ChangeThreadListener, Color, Colors, IColorPalette } from "../types.js";

export class ColorPalette extends Base implements IColorPalette {
    private messaging: IMessaging1<ChangeThreadEvent>;

    private buttons: Array<HTMLElement>;
    private activeColors: Array<string>;

    private readonly changeColorListeners: Array<(event: Event) => void>;

    // default colors provided by config 
    constructor(buttons: Array<HTMLElement>) {
        super(ColorPalette.name);

        assert.greaterThanZero(buttons?.length, "buttons.length");

        this.buttons = buttons;
        this.activeColors = this.buttons.map((button) => this.getButtonColor(button)).map((color) => this.normalizeColor(color));

        this.changeColorListeners = [];
        this.messaging = new Messaging1();

        this.subscribeButtons();
    }

    public onChangeThread(listener: ChangeThreadListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
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

        const colorsToInsert = Math.min(uniqueColors.length, this.buttons.length);

        for (let index = 0; index < colorsToInsert; index++) {
            const colorToInsert = uniqueColors[index];
            this.activeColors = [colorToInsert, ...this.activeColors];
        }

        for (let index = 0; index < this.buttons.length; index++) {
            const color = this.activeColors[index];
            const button = this.buttons[index];
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

    private handleChangeColor(event: Event): void {
        const element = event.currentTarget as Element;
        assert.defined(element, "target");

        const color = this.getElementColor(element);
        this.invokeChangeThread(color);
    }

    private getElementColor(element: Element): string {
        return getComputedStyle(element).backgroundColor;
    }

    private subscribeButtons(): void {
        this.buttons.forEach(button => {
            const handler = this.handleChangeColor.bind(this);
            button.addEventListener("click", handler);
            this.changeColorListeners.push(handler);
        });
    }

    private unsubscribeButtons(): void {

        assert.defined(this.buttons, "colorButtons");
        assert.defined(this.changeColorListeners, "changeColorListeners");

        for (let index = 0; index < this.buttons.length; index++) {
            const button = this.buttons[index];
            const listener = this.changeColorListeners[index];
            button.removeEventListener("click", listener);
        }
    }

    private invokeChangeThread(color: Color): void {
        const event = { name: "test", color, width: 12 }; // TODO: 
        this.messaging.sendToChannel1(event);
    }
}