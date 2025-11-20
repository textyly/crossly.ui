import assert from "../../asserts/assert.js";
import { Base } from "../../general/base.js";
import html from "../../utilities.ts/html.js";
import { Messaging2 } from "../../messaging/impl.js";
import { IMessaging2 } from "../../messaging/types.js";
import { Listener, VoidEvent, VoidListener, VoidUnsubscribe } from "../../types.js";
import { ChangeThreadEvent, ChangeThreadListener, IThreadPaletteMenu, Thread, Threads } from "./types.js";

export class ThreadPaletteMenu extends Base implements IThreadPaletteMenu {
    private readonly paletteMenuId = "thread-buttons-container";
    private readonly addThreadButtonId = "add-thread";
    private readonly buttonClassName = "thread-button";

    private readonly messaging: IMessaging2<ChangeThreadEvent, VoidEvent>;
    private readonly container: Element;

    private readonly threadButtons: Array<Element>;
    private readonly threadButtonsListeners: Array<Listener<Event>>;

    private readonly addButton: Element;
    private addButtonListener!: Listener<Event>;

    constructor(container: Element) {
        super(ThreadPaletteMenu.name);

        this.container = container;

        this.threadButtonsListeners = [];
        this.messaging = new Messaging2();

        this.addButton = html.getById(container, this.addThreadButtonId);

        let defaultThreads = this.getDefaultThreads(); // TODO: retrieve from a service and normalize color
        this.threadButtons = this.createThreadsButtons(defaultThreads);
        this.insertThreadButtons(container, this.threadButtons);

        this.subscribeAddButton(this.addButton);
    }

    public onChangeThread(listener: ChangeThreadListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onOpenThreadPicker(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public add(threads: Threads): void {
        assert.greaterThanZero(threads.length, "threads.length");

        const uniqueThreads = this.getUniqueThreads(threads);
        this.addCore(uniqueThreads);
    }

    public change(thread: Thread): void {
        this.add([thread]);
        this.invokeChangeThread(thread);
    }

    public override dispose(): void {
        super.ensureAlive();
        this.unsubscribeThreadButtons();
        this.unsubscribeAddButton()
        super.dispose();
    }

    private addCore(threads: Threads): void {
        threads.forEach((thread) => {
            const normalizedColor = this.normalizeColor(thread.color);
            const buttonsColors = this.threadButtons.map((button) => this.getElementColor(button));

            if (!buttonsColors.find((ac) => ac === normalizedColor)) {
                const button = this.createThreadButton({ ...thread, color: normalizedColor });
                this.insertThreadButtons(this.container, [button]);
                this.threadButtons.push(button);
            }
        });
    }

    private insertThreadButtons(container: Element, buttons: Array<Element>): void {
        const paletteMenu = html.getById(container, this.paletteMenuId);
        buttons.forEach((button) => paletteMenu.insertBefore(button, this.addButton));
    }

    private createThreadsButtons(threads: Threads): Array<Element> {
        const buttons: Array<Element> = [];

        threads.forEach((thread) => {
            const button = this.createThreadButton(thread);
            buttons.push(button);
        });

        return buttons;
    }

    private createThreadButton(thread: Thread): Element {
        const button = document.createElement("button");
        button.classList.add(this.buttonClassName);
        button.style.backgroundColor = thread.color;

        this.subscribeThreadButton(button);

        return button;
    }

    private getUniqueThreads(threads: Threads): Threads {
        const unique: Array<Thread> = []; // keep the order of the colors, do not use Set<string>

        threads.forEach((thread) => {
            const duplicate = unique.find((t) => t.color === thread.color);
            if (!duplicate) {
                unique.push(thread);
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

    private getDefaultThreads(): Threads {
        const threads: Threads = [
            { name: "test1", color: "#111e6a", width: 12 },
            { name: "test2", color: "#a9cdd6", width: 12 },
            { name: "test3", color: "#355f0d", width: 12 },
            { name: "test4", color: "#cf0013", width: 12 },
            { name: "test5", color: "#f5e500", width: 12 },
        ];

        return threads;
    }

    private handleChangeColor(event: Event): void {
        const element = event.currentTarget as Element;
        assert.defined(element, "target");

        const color = this.getElementColor(element);
        const thread = { name: "???", color, width: 12 }; //TODO: see also how canvas consume it!!!
        this.invokeChangeThread(thread);
    }

    private handleOpenThreadPicker(): void {
        this.invokeOpenThreadPicker();
    }

    private subscribeThreadButton(button: Element): void {
        const handler = this.handleChangeColor.bind(this);
        button.addEventListener("click", handler);
        this.threadButtonsListeners.push(handler);
    }

    private subscribeAddButton(button: Element): void {
        const handler = this.handleOpenThreadPicker.bind(this);
        button.addEventListener("click", handler);
        this.addButtonListener = handler;
    }

    private unsubscribeThreadButtons(): void {
        for (let index = 0; index < this.threadButtons.length; index++) {
            const button = this.threadButtons[index];
            const listener = this.threadButtonsListeners[index];
            button.removeEventListener("click", listener);
        }
    }

    private unsubscribeAddButton(): void {
        this.addButton.removeEventListener("click", this.addButtonListener);
    }

    private invokeChangeThread(thread: Thread): void {
        const event = { thread };
        this.messaging.sendToChannel1(event);
    }

    private invokeOpenThreadPicker(): void {
        const event = {};
        this.messaging.sendToChannel2(event);
    }
}