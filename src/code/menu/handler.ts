import { Base } from "../general/base.js";
import { IMenuHandler } from "./types.js";
import { ICrosslyCanvasFacade } from "../canvas/types.js";
import { ChangeStitchPatternEvent } from "../canvas/virtual/types.js";
import { ChangeThreadEvent, IMenu } from "./menus/types.js";

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
        const menu = this.menu.zoom;
        menu.zoomIn();
    }

    private handleCanvasZoomOut(): void {
        const menu = this.menu.zoom;
        menu.zoomOut();
    }

    private handleCanvasChangeStitchPattern(event: ChangeStitchPatternEvent): void {
        const colors = event.pattern
            .filter((threadPath) => threadPath.length > 0)
            .map((threadPath) => threadPath.color);

        if (colors.length > 0) {
            const menu = this.menu.palette;
            menu.add(colors);
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
        const paletteMenu = this.menu.palette;
        const changeThreadUn = paletteMenu.onChangeThread(this.handleMenuChangeThread.bind(this));
        super.registerUn(changeThreadUn);

        const undoMenu = this.menu.undo;
        const undoUn = undoMenu.onUndo(this.handleMenuUndo.bind(this));
        super.registerUn(undoUn);

        const redoUn = undoMenu.onRedo(this.handleMenuRedo.bind(this));
        super.registerUn(redoUn);

        const zoomMenu = this.menu.zoom;
        const zoominUn = zoomMenu.onZoomIn(this.handleMenuZoomIn.bind(this));
        super.registerUn(zoominUn);

        const zoomoutUn = zoomMenu.onZoomOut(this.handleMenuZoomOut.bind(this));
        super.registerUn(zoomoutUn);

        const splitViewMenu = this.menu.splitView;
        const splitUn = splitViewMenu.onToggleSplitView(this.handleMenuToggleSplitView.bind(this));
        super.registerUn(splitUn);

        const closeMenu = this.menu.close;
        const closeUn = closeMenu.onClose(this.handleBackSideMenuClose.bind(this));
        super.registerUn(closeUn);
    }
}