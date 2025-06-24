import assert from "../../asserts/assert.js";
import { Base } from "../../general/base.js";
import { VoidUnsubscribe } from "../../types.js";
import { Messaging1 } from "../../messaging/impl.js";
import { IMessaging1 } from "../../messaging/types.js";
import { ChangeThreadEvent, ChangeThreadListener, Color, Colors, IThreadPalette } from "../types.js";

export class ThreadPalette extends Base implements IThreadPalette {
    private messaging: IMessaging1<ChangeThreadEvent>;

    private readonly palette: Element;
    private readonly activeColors: Array<Color>;
    private readonly changeColorListeners: Array<(event: Event) => void>;

    // default colors provided by config 
    constructor(palette: Element) {
        super(ThreadPalette.name);

        this.palette = palette;

        this.changeColorListeners = [];
        this.messaging = new Messaging1();

        const buttons = this.palette.querySelectorAll("button");

        assert.defined(buttons, "buttons");
        assert.greaterThanZero(buttons?.length, "buttons.length");

        this.activeColors = [...buttons]
            .slice(0, buttons.length - 1) // filter out + button
            .map((button) => this.getButtonColor(button))
            .map((color) => this.normalizeColor(color));

        this.subscribeButtons(buttons);
    }

    public onChangeThread(listener: ChangeThreadListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public add(colors: Colors): void {
        assert.greaterThanZero(colors?.length, "colors.length");

        let uniqueColors = this.getUniqueColors(colors);
        assert.greaterThanZero(uniqueColors.length, "uniqueColors.length");

        uniqueColors.forEach((color) => {
            let normalized = this.normalizeColor(color);
            if (!this.activeColors.find((ac) => ac === normalized)) {
                this.activeColors.push(normalized);

                const button = this.createButton(normalized);
                const buttons = this.palette.querySelectorAll("button");

                this.palette.insertBefore(button, buttons[buttons.length - 1]);
                this.subscribeButton(button);
            }
        });
    }

    public override dispose(): void {
        this.unsubscribeButtons();
        super.dispose();
    }

    private createButton(color: Color): HTMLButtonElement {
        const button = document.createElement("button");

        // TODO:  color-button must be extracted from the existing buttons
        button.classList.add("color-button");

        button.style.backgroundColor = color;

        return button;
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

    private normalizeColor(color: string) {
        const temp = document.createElement("div");
        temp.style.color = color;
        document.body.appendChild(temp);

        const computedColor = getComputedStyle(temp).color;
        document.body.removeChild(temp);
        return computedColor;
    }

    private getElementColor(element: Element): string {
        return getComputedStyle(element).backgroundColor;
    }

    private subscribeButtons(buttons: NodeListOf<HTMLButtonElement>): void {
        buttons.forEach(button => this.subscribeButton(button));
    }

    private subscribeButton(button: HTMLButtonElement): void {
        const handler = this.handleChangeColor.bind(this);
        button.addEventListener("click", handler);
        this.changeColorListeners.push(handler);
    }

    private unsubscribeButtons(): void {
        const buttons = this.palette.querySelectorAll("button");

        assert.defined(buttons, "buttons");
        assert.greaterThanZero(buttons?.length, "buttons.length");

        assert.defined(this.changeColorListeners, "changeColorListeners");

        for (let index = 0; index < buttons.length; index++) {
            const button = buttons[index];
            const listener = this.changeColorListeners[index];
            button.removeEventListener("click", listener);
        }
    }

    private handleChangeColor(event: Event): void {
        const element = event.currentTarget as Element;
        assert.defined(element, "target");

        const color = this.getElementColor(element);
        this.invokeChangeThread(color);
    }

    private invokeChangeThread(color: Color): void {
        const event = { name: "test", color, width: 12 }; // TODO: 
        this.messaging.sendToChannel1(event);
    }
}