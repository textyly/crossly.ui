import { Position } from "./input/types.js";
import { IDisposable, Listener, VoidListener, VoidUnsubscribe } from "../types";
import { ICueThreadPath, IStitchThreadPath } from "./utilities/arrays/types.js";
import { ChangeFabricListener, ChangeStitchPatternListener } from "./virtual/types.js";

export type Bounds = { left: number, top: number, width: number, height: number };

export type DotIndex = { dotX: number, dotY: number };
export type BoundsIndexes = { leftTop: DotIndex, rightTop: DotIndex, leftBottom: DotIndex, rightBottom: DotIndex };

export type Id = number;
export type Dot = Position;
export type CueDot = Dot & { id: Id };
export type CueSegment = { id: Id, from: Dot, to: Dot, width: number, color: string };
export type CuePattern = Array<ICueThreadPath>;

export type StitchSegment = { from: Dot, to: Dot, width: number, color: string, side: CanvasSide };
export type StitchPattern = Array<IStitchThreadPath>;

export type FabricPattern = {
    name: string;
    color: string;
    columns: number;
    rows: number;
    dots: { color: string };
    threads: { color: string };
};

export interface ICanvas extends IDisposable {
    get bounds(): Bounds;
    set bounds(value: Bounds);

    onBoundsChange(listener: BoundsChangeListener): VoidUnsubscribe;
}

export interface ICrosslyCanvas extends ICanvas {
    onZoomIn(listener: VoidListener): VoidUnsubscribe;
    onZoomOut(listener: VoidListener): VoidUnsubscribe;
    onChangeFabric(listener: ChangeFabricListener): VoidUnsubscribe;
    onChangeStitchPattern(listener: ChangeStitchPatternListener): VoidUnsubscribe;
}

export interface ICrosslyCanvasFacade extends ICrosslyCanvas {
    get pattern(): CrosslyCanvasPattern;

    draw(): void;
    load(pattern: CrosslyCanvasPattern): void;

    clickDot(dotIdx: DotIndex): void;
    useThread(name: string, color: string, width: number): void;

    undo(): void;
    redo(): void;

    zoomIn(): void;
    zoomOut(): void;

    toggleSplitView(): void;
}

export interface IBackSideView {
    show(): void;
    hide(): void;
}

export interface ICrosslyCanvasObserver {
    onChange(listener: CrosslyCanvasChangeListener): VoidUnsubscribe;
}

export enum CanvasSide {
    Front,
    Back,
}

export enum Visibility {
    Visible,
    Hidden,
}

export enum DrawingMode {
    Draw,
    Suspend
}

export type BoundsChangeEvent = { bounds: Bounds };
export type BoundsChangeListener = Listener<BoundsChangeEvent>;

export type CrosslyCanvasPattern = { fabric: FabricPattern; stitch: StitchPattern; };
export type CrosslyCanvasChangeEvent = { pattern: CrosslyCanvasPattern; }
export type CrosslyCanvasChangeListener = Listener<CrosslyCanvasChangeEvent>;