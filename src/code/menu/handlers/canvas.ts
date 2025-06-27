import { Base } from "../../general/base.js";
import { IMenuCanvasHandler } from "../types.js";
import { ICrosslyCanvasFacade } from "../../canvas/types.js";
import { ChangeThreadEvent, IMenus } from "../menus/types.js";
import { ChangeStitchPatternEvent } from "../../canvas/virtual/types.js";

export class MenuCanvasHandler extends Base implements IMenuCanvasHandler {
    private readonly menus: IMenus;
    private readonly canvas: ICrosslyCanvasFacade;

    constructor(menus: IMenus, canvas: ICrosslyCanvasFacade) {
        super(MenuCanvasHandler.name);

        this.menus = menus;
        this.canvas = canvas;

        this.subscribe();
    }

    private handleMenuUndo(): void {
        super.ensureAlive();

        this.canvas.undo();
    }

    private handleMenuRedo(): void {
        super.ensureAlive();

        this.canvas.redo();
    }

    private handleMenuZoomIn(): void {
        super.ensureAlive();

        this.canvas.zoomIn();
    }

    private handleMenuZoomOut(): void {
        super.ensureAlive();

        this.canvas.zoomOut();
    }

    private handleMenuToggleSplitView(): void {
        super.ensureAlive();

        this.canvas.toggleSplitView();
    }

    private handleMenuChangeThread(event: ChangeThreadEvent): void {
        super.ensureAlive();

        this.canvas.useThread(event.name, event.color, event.width);
    }

    private handleBackSideMenuClose(): void {
        super.ensureAlive();

        // close button is being clicked so back side view is visible, just toggle
        this.canvas.toggleSplitView();
    }

    private handleCanvasZoomIn(): void {
        super.ensureAlive();

        const menu = this.menus.zoom;
        menu.zoomIn();
    }

    private handleCanvasZoomOut(): void {
        super.ensureAlive();

        const menu = this.menus.zoom;
        menu.zoomOut();
    }

    private handleCanvasChangeStitchPattern(event: ChangeStitchPatternEvent): void {
        super.ensureAlive();

        const colors = event.pattern
            .filter((threadPath) => threadPath.length > 0)
            .map((threadPath) => threadPath.color);

        if (colors.length > 0) {
            const menu = this.menus.threadPalette;
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
        const paletteMenu = this.menus.threadPalette;
        const changeThreadUn = paletteMenu.onChangeThread(this.handleMenuChangeThread.bind(this));
        super.registerUn(changeThreadUn);

        const undoMenu = this.menus.undo;
        const undoUn = undoMenu.onUndo(this.handleMenuUndo.bind(this));
        super.registerUn(undoUn);

        const redoUn = undoMenu.onRedo(this.handleMenuRedo.bind(this));
        super.registerUn(redoUn);

        const zoomMenu = this.menus.zoom;
        const zoominUn = zoomMenu.onZoomIn(this.handleMenuZoomIn.bind(this));
        super.registerUn(zoominUn);

        const zoomoutUn = zoomMenu.onZoomOut(this.handleMenuZoomOut.bind(this));
        super.registerUn(zoomoutUn);

        const splitViewMenu = this.menus.splitView;
        const splitUn = splitViewMenu.onToggleSplitView(this.handleMenuToggleSplitView.bind(this));
        super.registerUn(splitUn);

        const closeMenu = this.menus.close;
        const closeUn = closeMenu.onClose(this.handleBackSideMenuClose.bind(this));
        super.registerUn(closeUn);
    }
}