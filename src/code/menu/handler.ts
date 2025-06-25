import { Base } from "../general/base.js";
import { IMenuHandler } from "./types.js";
import { ICrosslyCanvasFacade } from "../canvas/types.js";
import { ChangeStitchPatternEvent } from "../canvas/virtual/types.js";
import { ChangeThreadEvent, IMenu } from "./components/types.js";

export class MenuHandler extends Base implements IMenuHandler {
    private readonly menu: IMenu;
    private readonly canvas: ICrosslyCanvasFacade;

    constructor(menu: IMenu, canvas: ICrosslyCanvasFacade) {
        super(MenuHandler.name);

        this.menu = menu;
        this.canvas = canvas;

        this.subscribe();
    }

    private handleMenuUndo(): void {
        this.canvas.undo();
    }

    private handleMenuRedo(): void {
        this.canvas.redo();
    }

    private handleMenuZoomIn(): void {
        this.canvas.zoomIn();
    }

    private handleMenuZoomOut(): void {
        this.canvas.zoomOut();
    }

    private handleMenuToggleSplitView(): void {
        this.canvas.toggleSplitView();
    }

    private handleMenuChangeThread(event: ChangeThreadEvent): void {
        this.canvas.useThread(event.name, event.color, event.width);
    }

    private handleBackSideMenuClose(): void {
        // close button is being clicked so back side view is visible, just toggle
        this.canvas.toggleSplitView();
    }

    private handleCanvasZoomIn(): void {
        const component = this.menu.zoom;
        component.zoomIn();
    }

    private handleCanvasZoomOut(): void {
        const component = this.menu.zoom;
        component.zoomOut();
    }

    private handleCanvasChangeStitchPattern(event: ChangeStitchPatternEvent): void {
        const colors = event.pattern
            .filter((threadPath) => threadPath.length > 0)
            .map((threadPath) => threadPath.color);

        if (colors.length > 0) {
            const component = this.menu.palette;
            component.add(colors);
        }
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

        const loadPatternUn = this.canvas.onChangeStitchPattern(this.handleCanvasChangeStitchPattern.bind(this));
        super.registerUn(loadPatternUn);
    }

    private subscribeMenu(): void {
        const paletteComponent = this.menu.palette;
        const changeThreadUn = paletteComponent.onChangeThread(this.handleMenuChangeThread.bind(this));
        super.registerUn(changeThreadUn);

        const undoComponent = this.menu.undo;
        const undoUn = undoComponent.onUndo(this.handleMenuUndo.bind(this));
        super.registerUn(undoUn);

        const redoUn = undoComponent.onRedo(this.handleMenuRedo.bind(this));
        super.registerUn(redoUn);

        const zoomComponent = this.menu.zoom;
        const zoominUn = zoomComponent.onZoomIn(this.handleMenuZoomIn.bind(this));
        super.registerUn(zoominUn);

        const zoomoutUn = zoomComponent.onZoomOut(this.handleMenuZoomOut.bind(this));
        super.registerUn(zoomoutUn);

        const splitViewComponent = this.menu.splitView;
        const splitUn = splitViewComponent.onToggleSplitView(this.handleMenuToggleSplitView.bind(this));
        super.registerUn(splitUn);

        const closeComponent = this.menu.close;
        const closeUn = closeComponent.onClose(this.handleBackSideMenuClose.bind(this));
        super.registerUn(closeUn);
    }
}