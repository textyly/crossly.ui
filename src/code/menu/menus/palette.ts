import assert from "../../asserts/assert.js";
import { Base } from "../../general/base.js";
import { Messaging1 } from "../../messaging/impl.js";
import { IMessaging1 } from "../../messaging/types.js";
import { Listener, VoidUnsubscribe } from "../../types.js";
import { ChangeThreadEvent, ChangeThreadListener, Color, Colors, IPaletteMenu } from "./types.js";

export class PaletteMenu extends Base implements IPaletteMenu {
    private readonly buttonClassName = "color-button";

    private readonly messaging: IMessaging1<ChangeThreadEvent>;
    private readonly container: Element;

    private readonly colorButtons: Array<Element>;
    private readonly colorButtonsListeners: Array<Listener<Event>>;

    private readonly addButton: Element;
    private addButtonListener!: Listener<Event>;

    constructor(container: Element) {
        super(PaletteMenu.name);

        this.container = container;

        this.colorButtonsListeners = [];
        this.messaging = new Messaging1();

        let defaultColors = ["#111e6a", "#a9cdd6", "#355f0d", "#cf0013", "#f5e500"]; // TODO: retrieve from a service
        defaultColors = defaultColors.map((color) => this.normalizeColor(color));

        this.colorButtons = this.createColorButtons(defaultColors);
        this.insertColorButtons(container, this.colorButtons);
        this.subscribeColorButtons();

        this.addButton = this.getAddButton(container);
        this.subscribeAddButton(this.addButton);
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
        this.unsubscribeColorButtons();
        this.unsubscribeAddButton()
        super.dispose();
    }

    private addCore(colors: Colors): void {
        colors.forEach((color) => {
            const normalizedColor = this.normalizeColor(color);
            const buttonsColors = this.colorButtons.map((button) => this.getElementColor(button));

            if (!buttonsColors.find((ac) => ac === normalizedColor)) {
                const button = this.createColorButton(normalizedColor);
                this.insertColorButtons(this.container, [button]);
                this.subscribeColorButton(button);
                this.colorButtons.push(button);
            }
        });
    }

    private insertColorButtons(container: Element, buttons: Array<Element>): void {
        const paletteMenu = this.getPaletteMenu(container);
        const addButton = this.getAddButton(container);
        buttons.forEach((b) => paletteMenu.insertBefore(b, addButton));
    }

    private createColorButtons(colors: Colors): Array<Element> {
        const buttons: Array<Element> = [];

        colors.forEach((color) => {
            const button = this.createColorButton(color);
            buttons.push(button);
        });

        return buttons;
    }

    private createColorButton(color: Color): Element {
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

    private handleOpenColorPicker(): void {
        const modalOverlay = document.querySelector("#modal-overlay") as HTMLElement;
        const modalDialog = document.querySelector("#modal-dialog") as HTMLElement;

        assert.defined(modalOverlay, "modalOverlay");
        assert.defined(modalDialog, "modalDialog");

        modalOverlay.style.display = "flex";
        modalDialog.style.display = "flex";
    }

    private subscribeColorButtons(): void {
        this.colorButtons.forEach((button) => this.subscribeColorButton(button));
    }

    private subscribeColorButton(button: Element): void {
        const handler = this.handleChangeColor.bind(this);
        button.addEventListener("click", handler);
        this.colorButtonsListeners.push(handler);
    }

    private subscribeAddButton(button: Element): void {
        const handler = this.handleOpenColorPicker.bind(this);
        button.addEventListener("click", handler);
        this.addButtonListener = handler;
    }

    private unsubscribeColorButtons(): void {
        for (let index = 0; index < this.colorButtons.length; index++) {
            const button = this.colorButtons[index];
            const listener = this.colorButtonsListeners[index];
            button.removeEventListener("click", listener);
        }
    }

    private unsubscribeAddButton(): void {
        this.addButton.removeEventListener("click", this.addButtonListener);
    }

    private invokeChangeThread(color: Color): void {
        const event = { name: "test", color, width: 12 }; // TODO: !!!
        this.messaging.sendToChannel1(event);
    }
}