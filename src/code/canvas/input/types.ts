import { Listener, VoidUnsubscribe } from "../../types";
import { ICanvas, IDisposable, BoundsChangeListener } from "../types";

export type CanvasEvent = { type: CanvasEventType, value?: Position };
export type ActiveTouches = { currentDistance: number };

export interface IInputCanvas extends ICanvas {
    onZoomIn(listener: ZoomInListener): VoidUnsubscribe;
    onZoomOut(listener: ZoomOutListener): VoidUnsubscribe;
    onMove(listener: MoveListener): VoidUnsubscribe;

    onPointerUp(listener: PointerUpListener): VoidUnsubscribe;
    onMove(listener: PointerDownListener): VoidUnsubscribe;
    onPointerMove(listener: PointerMoveListener): VoidUnsubscribe;
    // TODO: pointer leave

    onBoundsChange(listener: BoundsChangeListener): VoidUnsubscribe;
}

export interface ITouchInput extends IDisposable {
    get inZoomMode(): boolean;

    onZoomIn(listener: ZoomInListener): VoidUnsubscribe;
    onZoomOut(listener: ZoomOutListener): VoidUnsubscribe
}

export enum CanvasEventType {
    WheelChange = "wheel",
    ZoomIn = "zoomin",
    ZoomOut = "zoomout",
    Move = "Move",

    PointerMove = "pointermove",
    PointerDown = "pointerdown",
    PointerUp = "pointerup",
    PointerCancel = "pointercancel",

    TouchStart = "touchstart",
    TouchEnd = "touchend",
    TouchMove = "touchmove",
    TouchCancel = "touchcancel"
}

export type Position = { x: number, y: number };
export type PositionEvent = { position: Position };

export type PointerMoveEvent = PositionEvent;
export type PointerMoveListener = Listener<PointerMoveEvent>;

export type PointerUpEvent = PositionEvent;
export type PointerUpListener = Listener<PointerUpEvent>;

export type PointerDownEvent = PositionEvent;
export type PointerDownListener = Listener<PointerDownEvent>;

export type ZoomInEvent = {};
export type ZoomInListener = Listener<ZoomInEvent>;

export type ZoomOutEvent = {};
export type ZoomOutListener = Listener<ZoomOutEvent>;

export type MoveEvent = PositionEvent;
export type MoveListener = Listener<MoveEvent>;

export type PointerEventHandler = Listener<PointerEvent>;
export type TouchEventHandler = Listener<TouchEvent>;
export type WheelChangeHandler = Listener<WheelEvent>;