import { Base } from "../general/base.js";
import { IMenuHandler } from "./types.js";
import { ICrosslyCanvasFacade } from "../canvas/types.js";
import { ChangeStitchPatternEvent } from "../canvas/virtual/types.js";
import { ChangeThreadEvent, IComponents } from "./components/types.js";

export class MenuHandler extends Base implements IMenuHandler {
    private readonly components: IComponents;
    private readonly canvas: ICrosslyCanvasFacade;

    constructor(components: IComponents, canvas: ICrosslyCanvasFacade) {
        super(MenuHandler.name);

        this.components = components;
        this.canvas = canvas;

        this.subscribe();
    }

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

    private handleSplit(): void {
        this.canvas.toggleSplitView();
    }

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

        const splitViewComponent = this.components.splitView;
        const splitUn = splitViewComponent.onToggleSplitView(this.handleSplit.bind(this));
        super.registerUn(splitUn);
    }
}