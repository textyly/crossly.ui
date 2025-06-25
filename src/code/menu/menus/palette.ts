import assert from "../../asserts/assert.js";
import { Base } from "../../general/base.js";
import { VoidUnsubscribe } from "../../types.js";
import { Messaging1 } from "../../messaging/impl.js";
import { IMessaging1 } from "../../messaging/types.js";
import { ChangeThreadEvent, ChangeThreadListener, Color, Colors, IPaletteMenu } from "./types.js";

export class PaletteMenu extends Base implements IPaletteMenu {
    private messaging: IMessaging1<ChangeThreadEvent>;

    private readonly container: Element;
    private readonly activeColors: Array<Color>;
    private readonly colorButtonsListeners: Array<(event: Event) => void>;

    constructor(container: Element) {
        super(PaletteMenu.name);

        this.container = container;

        this.colorButtonsListeners = [];
        this.messaging = new Messaging1();

        const paletteMenu = this.getPaletteMenu(this.container);
        const buttons = this.getColorButtons(paletteMenu);

        this.activeColors = buttons
            .map((button) => this.getButtonColor(button))
            .map((color) => this.normalizeColor(color));

        this.subscribeButtons(buttons);
    }

    public onChangeThread(listener: ChangeThreadListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public add(colors: Colors): void {
        assert.greaterThanZero(colors.length, "colors.length");

        let uniqueColors = this.getUniqueColors(colors);
        assert.greaterThanZero(uniqueColors.length, "uniqueColors.length");

        uniqueColors.forEach((color) => {
            let normalized = this.normalizeColor(color);

            if (!this.activeColors.find((ac) => ac === normalized)) {
                this.activeColors.push(normalized);

                const newButton = this.createButton(normalized);
                const addButton = this.getAddButton(this.container);
                const paletteMenu = this.getPaletteMenu(this.container);

                paletteMenu.insertBefore(newButton, addButton);
                this.subscribeButton(newButton);
            }
        });
    }

    public override dispose(): void {
        this.unsubscribeButtons();
        super.dispose();
    }

    private getPaletteMenu(container: Element): Element {
        const paletteElement = container.querySelector('#color-buttons');
        assert.defined(paletteElement, "paletteElement");
        return paletteElement;
    }

    private getAddButton(container: Element): Element {
        const addElement = container.querySelector('#add-color');
        assert.defined(addElement, "addElement");
        return addElement;
    }

    private getColorButtons(container: Element): Array<Element> {
        const elements = container.querySelectorAll(".color-button");
        assert.greaterThanZero(elements.length, "buttons.length");
        return [...elements];
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

    private subscribeButtons(buttons: Array<Element>): void {
        buttons.forEach(button => this.subscribeButton(button));
    }

    private subscribeButton(button: Element): void {
        const handler = this.handleChangeColor.bind(this);
        button.addEventListener("click", handler);
        this.colorButtonsListeners.push(handler);
    }

    private unsubscribeButtons(): void {
        const buttons = this.container.querySelectorAll("button");

        assert.defined(buttons, "buttons");
        assert.greaterThanZero(buttons?.length, "buttons.length");

        assert.defined(this.colorButtonsListeners, "changeColorListeners");

        for (let index = 0; index < buttons.length; index++) {
            const button = buttons[index];
            const listener = this.colorButtonsListeners[index];
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