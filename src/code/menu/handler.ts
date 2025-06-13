import assert from "../asserts/assert.js";
import { Base } from "../general/base.js";
import { ICrosslyCanvasFacade } from "../canvas/types.js";
import { IMenuHandler, IMenuProvider } from "./types.js";
import { ChangeStitchPatternEvent } from "../canvas/virtual/types.js";

export class MenuHandler extends Base implements IMenuHandler {
    private currentZoomLevel = 120;

    private readonly canvas: ICrosslyCanvasFacade;
    private readonly menuProvider: IMenuProvider;

    private readonly changeColorListeners: Array<(event: Event) => void>;
    private readonly actionListeners: Array<(event: Event) => void>;
    private keyboardListener: (event: KeyboardEvent) => void;

    constructor(canvas: ICrosslyCanvasFacade, menuProvider: IMenuProvider) {
        super(MenuHandler.name);

        this.canvas = canvas;
        this.menuProvider = menuProvider;

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
        const element = this.menuProvider.zoomLevel;
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
        const element = event.currentTarget as Element;
        assert.defined(element, "target");

        const color = this.getElementColor(element);
        this.canvas.useThread("test", color, 12); // TODO: !!!
    }

    private handleAction(event: Event): void {
        const target = event.currentTarget as any;
        assert.defined(target, "target");

        const action = target.dataset.action;

        switch (action) {
            case "undo":
                this.canvas.undo();
                break;
            case "redo":
                this.canvas.redo();
                break;
            case "zoom-in":
                this.canvas.zoomIn();
                break;
            case "zoom-out":
                this.canvas.zoomOut();
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

    private handleChangeStitchPattern(event: ChangeStitchPatternEvent): void {
        const colors = event.pattern
            .filter((threadPath) => threadPath.length > 0)
            .map((threadPath) => threadPath.color);

        this.menuProvider.colorPalette.insert(colors);
    }

    private toggleSplitView(): void {
        const backSideContainer = this.menuProvider.backSideContainer;
        const display = backSideContainer.style.display;

        backSideContainer.style.display = (display === "flex") ? "none" : "flex";
    }

    private getElementColor(element: Element): string {
        return getComputedStyle(element).backgroundColor;
    }

    private subscribe(): void {
        const zoomInUn = this.canvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.canvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);

        const loadPatternUn = this.canvas.onChangeStitchPattern(this.handleChangeStitchPattern.bind(this));
        super.registerUn(loadPatternUn);

        this.subscribeColorButtons();
        this.subscribeActionButtons();
        this.subscribeKeyboardEvents();
    }

    private subscribeColorButtons(): void {
        this.menuProvider.colorPalette.buttons.forEach(button => {
            const handler = this.handleChangeColor.bind(this);
            button.addEventListener("click", handler);
            this.changeColorListeners.push(handler);
        });
    }

    private subscribeActionButtons(): void {
        this.menuProvider.actionButtons.forEach(button => {
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
        const colorButtons = this.menuProvider.colorPalette.buttons;

        assert.defined(colorButtons, "colorButtons");
        assert.defined(this.changeColorListeners, "changeColorListeners");

        for (let index = 0; index < colorButtons.length; index++) {
            const button = colorButtons[index];
            const listener = this.changeColorListeners[index];
            button.removeEventListener("click", listener);
        }
    }

    private unsubscribeActionButtons(): void {
        const actionButtons = this.menuProvider.actionButtons;

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