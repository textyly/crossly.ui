import { IFabricDotArray } from "../utilities/arrays/types.js";
import { FabricThreadArray } from "../utilities/arrays/thread/fabric.js";
import { Listener, VoidListener, VoidUnsubscribe } from "../../types.js";
import {
    Id,
    CueDot,
    ICanvas,
    CuePattern,
    CueSegment,
    StitchPattern,
    StitchSegment,
    FabricPattern,
    DotIndex,
} from "../types.js";

export interface IVirtualCanvas extends ICanvas {
    onRedraw(listener: VoidListener): VoidUnsubscribe;
    onMoveStart(listener: VoidListener): VoidUnsubscribe;
    onMoveStop(listener: VoidListener): VoidUnsubscribe;
}

export interface IFabricCanvas extends IVirtualCanvas {
    onChange(listener: ChangeFabricListener): VoidUnsubscribe;
    onDrawDots(listener: DrawFabricDotsListener): VoidUnsubscribe;
    onDrawThreads(listener: DrawFabricThreadsListener): VoidUnsubscribe;
}

export interface IStitchCanvas extends IVirtualCanvas {
    onChange(listener: ChangeStitchPatternListener): VoidUnsubscribe;
    onDrawSegment(listener: DrawStitchSegmentListener): VoidUnsubscribe;
    onDrawPattern(listener: DrawStitchPatternListener): VoidUnsubscribe;
}

export interface ICueCanvas extends IVirtualCanvas {
    onDrawDot(listener: DrawCueDotListener): VoidUnsubscribe;
    onDrawDashDot(listener: DrawCueDotListener): VoidUnsubscribe; //TODO: rename
    onRemoveDot(listener: RemoveCueDotListener): VoidUnsubscribe;
    onDrawSegment(listener: DrawCueSegmentListener): VoidUnsubscribe;
    onDrawDashSegment(listener: DrawCueSegmentListener): VoidUnsubscribe; //TODO: rename
    onMoveSegment(listener: MoveCueSegmentListener): VoidUnsubscribe;
    onRemoveSegment(listener: RemoveCueSegmentListener): VoidUnsubscribe;
}

export interface IFabricCanvasFacade extends IFabricCanvas {
    get pattern(): FabricPattern;

    draw(): void;
    load(pattern: FabricPattern): void;

    zoomIn(): void;
    zoomOut(): void;
}

export interface IStitchCanvasFacade extends IStitchCanvas {
    get pattern(): StitchPattern;

    draw(): void;
    load(pattern: StitchPattern): void;

    clickDot(dotIdx: DotIndex): void;
    useThread(name: string, color: string, width: number): void;

    undo(): void;
    redo(): void;

    zoomIn(): void;
    zoomOut(): void;
}

export interface ICueCanvasFacade extends ICueCanvas {
    get pattern(): CuePattern;

    draw(): void;
    load(pattern: StitchPattern): void;

    clickDot(dotIdx: DotIndex): void;
    useThread(name: string, color: string, width: number): void;

    undo(): void;
    redo(): void;

    zoomIn(): void;
    zoomOut(): void;
}

export type ChangeFabricEvent = { pattern: FabricPattern; };
export type ChangeFabricListener = Listener<ChangeFabricEvent>;

export type DrawFabricDotsEvent = { dots: IFabricDotArray; };
export type DrawFabricDotsListener = Listener<DrawFabricDotsEvent>;

export type DrawFabricThreadsEvent = { threads: FabricThreadArray; };
export type DrawFabricThreadsListener = Listener<DrawFabricThreadsEvent>;

export type DrawStitchSegmentEvent = { segment: StitchSegment; density: Density; };
export type DrawStitchSegmentListener = Listener<DrawStitchSegmentEvent>;

export type ChangeStitchPatternEvent = { pattern: StitchPattern; };
export type ChangeStitchPatternListener = Listener<ChangeStitchPatternEvent>;

export type DrawStitchPatternEvent = { pattern: StitchPattern; density: Density; };
export type DrawStitchPatternListener = Listener<DrawStitchPatternEvent>;

export type DrawCueDotEvent = { dot: CueDot; dotRadius: number; dotColor: string; };
export type DrawCueDotListener = Listener<DrawCueDotEvent>;

export type DrawCueSegmentEvent = { segment: CueSegment; };
export type DrawCueSegmentListener = Listener<DrawCueSegmentEvent>;

export type RemoveCueDotEvent = { dotId: Id; };
export type RemoveCueDotListener = Listener<RemoveCueDotEvent>;

export type MoveCueSegmentEvent = { segment: CueSegment; };
export type MoveCueSegmentListener = Listener<MoveCueSegmentEvent>;

export type RemoveCueSegmentEvent = { segmentId: Id; };
export type RemoveCueSegmentListener = Listener<RemoveCueSegmentEvent>;

export enum Density {
    Low,
    Medium,
    High
}