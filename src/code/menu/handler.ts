import { Base } from "../general/base.js";
import { IMenuHandler } from "./types.js";
import { ICrosslyCanvasFacade } from "../canvas/types.js";
import { ChangeStitchPatternEvent } from "../canvas/virtual/types.js";
import { ChangeThreadEvent, IMenuComponents } from "./components/types.js";

export class MenuHandler extends Base implements IMenuHandler {
    private readonly components: IMenuComponents;
    private readonly canvas: ICrosslyCanvasFacade;

    constructor(components: IMenuComponents, canvas: ICrosslyCanvasFacade) {
        super(MenuHandler.name);

        this.components = components;
        this.canvas = canvas;

        this.subscribe();
    }

    private handleComponentUndo(): void {
        this.canvas.undo();
    }

    private handleComponentRedo(): void {
        this.canvas.redo();
    }

    private handleComponentZoomIn(): void {
        this.canvas.zoomIn();
    }

    private handleComponentZoomOut(): void {
        this.canvas.zoomOut();
    }

    private handleComponentToggleSplitView(): void {
        this.canvas.toggleSplitView();
    }

    private handleComponentChangeThread(event: ChangeThreadEvent): void {
        this.canvas.useThread(event.name, event.color, event.width);
    }

    private handleComponentClose(): void {
        // close button is being clicked so back side view is visible, just toggle
        this.canvas.toggleSplitView();
    }

    private handleCanvasZoomIn(): void {
        const component = this.components.zoom;
        component.zoomIn();
    }

    private handleCanvasZoomOut(): void {
        const component = this.components.zoom;
        component.zoomOut();
    }

    private handleCanvasChangeStitchPattern(event: ChangeStitchPatternEvent): void {
        const colors = event.pattern
            .filter((threadPath) => threadPath.length > 0)
            .map((threadPath) => threadPath.color);

        if (colors.length > 0) {
            const component = this.components.palette;
            component.add(colors);
        }
    }

    private subscribe(): void {
        this.subscribeCanvas();
        this.subscribeComponents();
    }

    private subscribeCanvas(): void {
        const zoomInUn = this.canvas.onZoomIn(this.handleCanvasZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.canvas.onZoomOut(this.handleCanvasZoomOut.bind(this));
        super.registerUn(zoomOutUn);

        const loadPatternUn = this.canvas.onChangeStitchPattern(this.handleCanvasChangeStitchPattern.bind(this));
        super.registerUn(loadPatternUn);
    }

    private subscribeComponents(): void {
        const paletteComponent = this.components.palette;
        const changeThreadUn = paletteComponent.onChangeThread(this.handleComponentChangeThread.bind(this));
        super.registerUn(changeThreadUn);

        const undoComponent = this.components.undo;
        const undoUn = undoComponent.onUndo(this.handleComponentUndo.bind(this));
        super.registerUn(undoUn);

        const redoUn = undoComponent.onRedo(this.handleComponentRedo.bind(this));
        super.registerUn(redoUn);

        const zoomComponent = this.components.zoom;
        const zoominUn = zoomComponent.onZoomIn(this.handleComponentZoomIn.bind(this));
        super.registerUn(zoominUn);

        const zoomoutUn = zoomComponent.onZoomOut(this.handleComponentZoomOut.bind(this));
        super.registerUn(zoomoutUn);

        const splitViewComponent = this.components.splitView;
        const splitUn = splitViewComponent.onToggleSplitView(this.handleComponentToggleSplitView.bind(this));
        super.registerUn(splitUn);

        const closeComponent = this.components.close;
        const closeUn = closeComponent.onClose(this.handleComponentClose.bind(this));
        super.registerUn(closeUn);
    }
}