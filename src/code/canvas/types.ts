import { Position } from "./input/types.js";
import { IDisposable, Listener, VoidUnsubscribe } from "../types";
import { ICueThreadArray, IThreadPath } from "./utilities/arrays/types.js";
import { ChangeFabricListener, ChangeStitchPatternListener } from "./virtual/types.js";

export type Bounds = { left: number, top: number, width: number, height: number };

export type DotIndex = { dotX: number, dotY: number };
export type BoundsIndexes = { leftTop: DotIndex, rightTop: DotIndex, leftBottom: DotIndex, rightBottom: DotIndex };

export type Id = number;
export type Dot = Position;
export type CueDot = Dot & { id: Id };
export type CueSegment = { id: Id, from: Dot, to: Dot, width: number, color: string };
export type CuePattern = Array<ICueThreadArray>;

export type StitchSegment = { from: Dot, to: Dot, width: number, color: string };
export type StitchPattern = Array<IThreadPath>;

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
    onChangeName(listener: ChangeNameListener): VoidUnsubscribe;
    onChangeFabric(listener: ChangeFabricListener): VoidUnsubscribe;
    onChangeStitchPattern(listener: ChangeStitchPatternListener): VoidUnsubscribe;
}

export interface ICrosslyCanvasFacade extends ICrosslyCanvas {
    get name(): string;
    get pattern(): CrosslyCanvasPattern;

    draw(): void;
    load(pattern: CrosslyCanvasPattern): void;
    useThread(name: string, color: string, width: number): void;
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
    Invisible,
}

export type BoundsChangeEvent = { bounds: Bounds };
export type BoundsChangeListener = Listener<BoundsChangeEvent>;

export type ChangeNameEvent = { name: string; };
export type ChangeNameListener = Listener<ChangeNameEvent>;

export type CrosslyCanvasPattern = { name: string; fabric: FabricPattern; stitch: StitchPattern; };
export type CrosslyCanvasChangeEvent = { pattern: CrosslyCanvasPattern; }
export type CrosslyCanvasChangeListener = Listener<CrosslyCanvasChangeEvent>;