import assert from "../asserts/assert.js";
import { Base } from "../general/base.js";
import { IMenuHandler } from "./types.js";
import { ICrosslyCanvasFacade } from "../canvas/types.js";
import { ChangeThreadEvent, IComponentsProvider } from "./components/types.js";
import { ChangeStitchPatternEvent } from "../canvas/virtual/types.js";

export class MenuHandler extends Base implements IMenuHandler {
    private currentZoomLevel = 120;

    private readonly canvas: ICrosslyCanvasFacade;
    private readonly menuProvider: IComponentsProvider;

    private readonly actionListeners: Array<(event: Event) => void>;
    private keyboardListener: (event: KeyboardEvent) => void;

    constructor(componentsProvider: IComponentsProvider, canvas: ICrosslyCanvasFacade) {
        super(MenuHandler.name);

        this.canvas = canvas;
        this.menuProvider = componentsProvider;

        this.zoomElement = this.currentZoomLevel;

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

    private handleAction(event: Event): void {
        const target = event.currentTarget as any;
        assert.defined(target, "target");

        const action = target.dataset.action;

        switch (action) {
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

        if (colors.length > 0) {
            this.menuProvider.paletteComponent.add(colors);
        }
    }

    private handleChangeThread(event: ChangeThreadEvent): void {
        this.canvas.useThread(event.name, event.color, event.width);
    }

    private handleUndo(): void {
        this.canvas.undo();
    }

    private handleRedo(): void {
        this.canvas.redo();
    }

    private toggleSplitView(): void {
        const backSideContainer = this.menuProvider.backSideContainer;
        const display = backSideContainer.style.display;

        backSideContainer.style.display = (display === "flex") ? "none" : "flex";
    }

    private subscribe(): void {
        this.subscribeCanvas();
        this.subscribeMenu();
    }

    private subscribeCanvas(): void {
        const zoomInUn = this.canvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.canvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);

        const loadPatternUn = this.canvas.onChangeStitchPattern(this.handleChangeStitchPattern.bind(this));
        super.registerUn(loadPatternUn);
    }

    private subscribeMenu(): void {
        const paletteComponent = this.menuProvider.paletteComponent;
        const changeThreadUn = paletteComponent.onChangeThread(this.handleChangeThread.bind(this));
        super.registerUn(changeThreadUn);

        const undoComponent = this.menuProvider.undoComponent;
        const undoUn = undoComponent.onUndo(this.handleUndo.bind(this));
        super.registerUn(undoUn);

        const redoUn = undoComponent.onRedo(this.handleRedo.bind(this));
        super.registerUn(redoUn);

        this.subscribeActionButtons();
        this.subscribeKeyboardEvents();
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
        // no need to unsubscribe canvas
        this.unsubscribeMenu();
    }

    private unsubscribeMenu(): void {
        this.unsubscribeActionButtons();
        this.unsubscribeKeyboardEvents();
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