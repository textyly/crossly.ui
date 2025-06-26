import assert from "../../asserts/assert.js";
import { Base } from "../../general/base.js";
import { VoidUnsubscribe } from "../../types.js";
import { Messaging1 } from "../../messaging/impl.js";
import { IMessaging1 } from "../../messaging/types.js";
import { ChangeThreadEvent, ChangeThreadListener, Color, Colors, IPaletteMenu } from "./types.js";

export class PaletteMenu extends Base implements IPaletteMenu {
    private readonly buttonClassName = "color-button";

    private readonly messaging: IMessaging1<ChangeThreadEvent>;
    private readonly container: Element;

    private readonly buttons: Array<Element>;
    private readonly buttonsListeners: Array<(event: Event) => void>;

    constructor(container: Element) {
        super(PaletteMenu.name);

        this.container = container;

        this.buttonsListeners = [];
        this.messaging = new Messaging1();

        let defaultColors = ["#111e6a", "#a9cdd6", "#355f0d", "#cf0013", "#f5e500"]; // TODO: retrieve from a service
        defaultColors = defaultColors.map((color) => this.normalizeColor(color));

        this.buttons = this.createButtons(defaultColors);
        this.insertButtons(container, this.buttons);
        this.subscribeButtons(this.buttons);
    }

    public onChangeThread(listener: ChangeThreadListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public add(colors: Colors): void {
        assert.greaterThanZero(colors.length, "colors.length");

        const uniqueColors = this.getUniqueColors(colors);
        this.addCore(uniqueColors);
    }

    public override dispose(): void {
        this.unsubscribeButtons();
        super.dispose();
    }

    private addCore(colors: Colors): void {
        colors.forEach((color) => {
            const normalizedColor = this.normalizeColor(color);
            const buttonsColors = this.buttons.map((button) => this.getElementColor(button));

            if (!buttonsColors.find((ac) => ac === normalizedColor)) {
                const button = this.createButton(normalizedColor);
                this.insertButtons(this.container, [button]);
                this.subscribeButton(button);
                this.buttons.push(button);
            }
        });
    }

    private insertButtons(container: Element, buttons: Array<Element>): void {
        const paletteMenu = this.getPaletteMenu(container);
        const addButton = this.getAddButton(container);
        buttons.forEach((b) => paletteMenu.insertBefore(b, addButton));
    }

    private createButtons(colors: Colors): Array<Element> {
        const buttons: Array<Element> = [];

        colors.forEach((color) => {
            const button = this.createButton(color);
            buttons.push(button);
        });

        return buttons;
    }

    private createButton(color: Color): Element {
        const button = document.createElement("button");
        button.classList.add(this.buttonClassName);
        button.style.backgroundColor = color;
        return button;
    }

    private getPaletteMenu(container: Element): Element {
        const paletteElement = container.querySelector('#color-buttons-container');
        assert.defined(paletteElement, "paletteElement");
        return paletteElement;
    }

    private getAddButton(container: Element): Element {
        const addElement = container.querySelector('#add-color');
        assert.defined(addElement, "addElement");
        return addElement;
    }

    private getUniqueColors(colors: Array<string>): Array<string> {
        const unique: Array<string> = []; // keep the order of the colors, do not use Set<string>

        colors.forEach((color) => {
            const duplicate = unique.find((c) => c === color);
            if (!duplicate) {
                unique.push(color);
            }
        });

        return unique;
    }

    private getElementColor(element: Element): string {
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

    private handleChangeColor(event: Event): void {
        const element = event.currentTarget as Element;
        assert.defined(element, "target");

        const color = this.getElementColor(element);
        this.invokeChangeThread(color);
    }

    private subscribeButtons(buttons: Array<Element>): void {
        buttons.forEach(button => this.subscribeButton(button));
    }

    private subscribeButton(button: Element): void {
        const handler = this.handleChangeColor.bind(this);
        button.addEventListener("click", handler);
        this.buttonsListeners.push(handler);
    }

    private unsubscribeButtons(): void {
        for (let index = 0; index < this.buttons.length; index++) {
            const button = this.buttons[index];
            const listener = this.buttonsListeners[index];
            button.removeEventListener("click", listener);
        }
    }

    private invokeChangeThread(color: Color): void {
        const event = { name: "test", color, width: 12 }; // TODO: !!!
        this.messaging.sendToChannel1(event);
    }
}