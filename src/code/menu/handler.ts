import { Base } from "../general/base.js";
import { IMenuHandler } from "./types.js";
import { ICrosslyCanvasFacade } from "../canvas/types.js";
import { ChangeStitchPatternEvent } from "../canvas/virtual/types.js";
import { ChangeThreadEvent, IComponents } from "./components/types.js";

export class MenuHandler extends Base implements IMenuHandler {
    private readonly components: IComponents;
    private readonly canvas: ICrosslyCanvasFacade;

    // private readonly actionListeners: Array<(event: Event) => void>;
    // private keyboardListener: (event: KeyboardEvent) => void;

    constructor(components: IComponents, canvas: ICrosslyCanvasFacade) {
        super(MenuHandler.name);

        this.components = components;
        this.canvas = canvas;

        // this.actionListeners = [];
        // this.keyboardListener = () => { };

        this.subscribe();
    }

    // private handleAction(event: Event): void {
    //     const target = event.currentTarget as any;
    //     assert.defined(target, "target");

    //     const action = target.dataset.action;

    //     switch (action) {
    //         case "split":
    //         case "close": {
    //             this.toggleSplitView();
    //             break;
    //         }
    //         default: {
    //             // TODO: throw new Error("unknown action.");
    //         }
    //     }
    // }

    // private handleKeyDown(event: KeyboardEvent): void {
    //     const toggleSplitViewCode = "Backslash";
    //     if (event.ctrlKey && event.code === toggleSplitViewCode) {
    //         this.toggleSplitView();
    //     }
    // }

    private handleChangeStitchPattern(event: ChangeStitchPatternEvent): void {
        const colors = event.pattern
            .filter((threadPath) => threadPath.length > 0)
            .map((threadPath) => threadPath.color);

        if (colors.length > 0) {
            this.components.palette.add(colors);
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

    private handleCanvasZoomIn(): void {
        this.components.zoom.zoomIn();
    }

    private handleCanvasZoomOut(): void {
        this.components.zoom.zoomOut();
    }

    private handleButtonZoomIn(): void {
        this.canvas.zoomIn();
    }

    private handleButtonZoomOut(): void {
        this.canvas.zoomOut();
    }

    // private toggleSplitView(): void {
    //     const backSideContainer = this.components.backSideContainer;
    //     const display = backSideContainer.style.display;

    //     backSideContainer.style.display = (display === "flex") ? "none" : "flex";
    // }

    private subscribe(): void {
        this.subscribeCanvas();
        this.subscribeMenu();
    }

    private subscribeCanvas(): void {
        const zoomInUn = this.canvas.onZoomIn(this.handleCanvasZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.canvas.onZoomOut(this.handleCanvasZoomOut.bind(this));
        super.registerUn(zoomOutUn);

        const loadPatternUn = this.canvas.onChangeStitchPattern(this.handleChangeStitchPattern.bind(this));
        super.registerUn(loadPatternUn);
    }

    private subscribeMenu(): void {
        const paletteComponent = this.components.palette;
        const changeThreadUn = paletteComponent.onChangeThread(this.handleChangeThread.bind(this));
        super.registerUn(changeThreadUn);

        const undoComponent = this.components.undo;
        const undoUn = undoComponent.onUndo(this.handleUndo.bind(this));
        super.registerUn(undoUn);

        const redoUn = undoComponent.onRedo(this.handleRedo.bind(this));
        super.registerUn(redoUn);

        const zoomComponent = this.components.zoom;
        const zoominUn = zoomComponent.onZoomIn(this.handleButtonZoomIn.bind(this));
        super.registerUn(zoominUn);

        const zoomoutUn = zoomComponent.onZoomOut(this.handleButtonZoomOut.bind(this));
        super.registerUn(zoomoutUn);

        // this.subscribeActionButtons();
        // this.subscribeKeyboardEvents();
    }

    // private subscribeActionButtons(): void {
    //     this.components.actionButtons.forEach(button => {
    //         const handler = this.handleAction.bind(this);
    //         button.addEventListener("click", handler);
    //         this.actionListeners.push(handler);
    //     });
    // }

    // private subscribeKeyboardEvents(): void {
    //     this.keyboardListener = this.handleKeyDown.bind(this);
    //     document.addEventListener("keydown", this.keyboardListener);
    // }

    // private unsubscribe(): void {
    //     // no need to unsubscribe canvas
    //     this.unsubscribeMenu();
    // }

    // private unsubscribeMenu(): void {
    //     this.unsubscribeActionButtons();
    //     this.unsubscribeKeyboardEvents();
    // }

    // private unsubscribeActionButtons(): void {
    //     const actionButtons = this.components.actionButtons;

    //     assert.defined(actionButtons, "actionButtons");
    //     assert.defined(this.actionListeners, "actionListeners");

    //     for (let index = 0; index < actionButtons.length; index++) {
    //         const button = actionButtons[index];
    //         const listener = this.actionListeners[index];
    //         button.removeEventListener("click", listener);
    //     }
    // }

    // private unsubscribeKeyboardEvents(): void {
    //     document.removeEventListener("keydown", this.keyboardListener);
    // }
}