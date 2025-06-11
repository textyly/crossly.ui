import assert from "../asserts/assert.js";
import { Base } from "../general/base.js";
import { IMenuCanvasBroker } from "../brokers/types.js";
import { IMenuHandler, IMenuElementProvider } from "./types.js";

export class MenuHandler extends Base implements IMenuHandler {
    private currentZoomLevel = 120;

    private readonly menuCanvasBroker: IMenuCanvasBroker;
    private readonly menuItemProvider: IMenuElementProvider;

    private readonly changeColorListeners: Array<(event: Event) => void>;
    private readonly actionListeners: Array<(event: Event) => void>;
    private keyboardListener: (event: KeyboardEvent) => void;

    constructor(menuCanvasBroker: IMenuCanvasBroker, menuElementProvider: IMenuElementProvider) {
        super(MenuHandler.name);

        this.menuCanvasBroker = menuCanvasBroker;
        this.menuItemProvider = menuElementProvider;

        this.zoomElement = this.currentZoomLevel;

        this.changeColorListeners = [];
        this.actionListeners = [];
        this.keyboardListener = () => { };

        this.subscribe();
    }

    public override dispose(): void {
        this.unsubscribe();
        super.dispose();
    }

    private set zoomElement(value: number) {
        const element = this.menuItemProvider.zoomLevel;
        element.innerHTML = `${value}%`;
    }

    private handleZoomIn(): void {
        this.currentZoomLevel += 10;
        this.zoomElement = this.currentZoomLevel;
    }

    private handleZoomOut(): void {
        this.currentZoomLevel -= 10;
        this.zoomElement = this.currentZoomLevel;
    }

    private handleChangeColor(event: Event): void {
        const target = event.currentTarget as any;
        assert.defined(target, "target");

        const color = getComputedStyle(target).backgroundColor;
        this.menuCanvasBroker.change(color);
    }

    private handleAction(event: Event): void {
        const target = event.currentTarget as any;
        assert.defined(target, "target");

        const action = target.dataset.action;

        switch (action) {
            case "undo":
                this.menuCanvasBroker.undo();
                break;
            case "redo":
                this.menuCanvasBroker.redo();
                break;
            case "zoom-in":
                this.menuCanvasBroker.zoomIn();
                break;
            case "zoom-out":
                this.menuCanvasBroker.zoomOut();
                break;
            case "split":
            case "close": {
                this.toggleSplitView();
                break;
            }
            default: {
                // TODO: throw new Error("unknown action.");
            }
        }
    }

    private handleKeyDown(event: KeyboardEvent): void {
        const toggleSplitViewCode = "Backslash";
        if (event.ctrlKey && event.code === toggleSplitViewCode) {
            this.toggleSplitView();
        }
    }

    private toggleSplitView(): void {
        const backSideContainer = this.menuItemProvider.backSideContainer;
        const display = backSideContainer.style.display;

        backSideContainer.style.display = (display === "flex") ? "none" : "flex";
    }

    private subscribe(): void {
        const zoomInUn = this.menuCanvasBroker.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.menuCanvasBroker.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);

        this.subscribeColorButtons();
        this.subscribeActionButtons();
        this.subscribeKeyboardEvents();
    }

    private subscribeColorButtons(): void {
        this.menuItemProvider.colorButtons.forEach(button => {
            const handler = this.handleChangeColor.bind(this);
            button.addEventListener("click", handler);
            this.changeColorListeners.push(handler);
        });
    }

    private subscribeActionButtons(): void {
        this.menuItemProvider.actionButtons.forEach(button => {
            const handler = this.handleAction.bind(this);
            button.addEventListener("click", handler);
            this.actionListeners.push(handler);
        });
    }

    private subscribeKeyboardEvents(): void {
        this.keyboardListener = this.handleKeyDown.bind(this);
        document.addEventListener("keydown", this.keyboardListener);
    }

    private unsubscribe(): void {
        this.unsubscribeColorButtons();
        this.unsubscribeActionButtons();
        this.unsubscribeKeyboardEvents();
    }

    private unsubscribeColorButtons(): void {
        const colorButtons = this.menuItemProvider.colorButtons;

        assert.defined(colorButtons, "colorButtons");
        assert.defined(this.changeColorListeners, "changeColorListeners");

        for (let index = 0; index < colorButtons.length; index++) {
            const button = colorButtons[index];
            const listener = this.changeColorListeners[index];
            button.removeEventListener("click", listener);
        }
    }

    private unsubscribeActionButtons(): void {
        const actionButtons = this.menuItemProvider.actionButtons;

        assert.defined(actionButtons, "actionButtons");
        assert.defined(this.actionListeners, "actionListeners");

        for (let index = 0; index < actionButtons.length; index++) {
            const button = actionButtons[index];
            const listener = this.actionListeners[index];
            button.removeEventListener("click", listener);
        }
    }

    private unsubscribeKeyboardEvents(): void {
        document.removeEventListener("keydown", this.keyboardListener);
    }
}