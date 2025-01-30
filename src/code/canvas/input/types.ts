import { ICanvas, IDisposable, SizeChangeListener } from "../types";
import { Listener, VoidUnsubscribe } from "../../types";

export type CanvasEvent = { type: CanvasEventsType, value?: Position };
export type ActiveTouches = { currentDistance: number };
export type VisibleArea = { left: number; top: number; width: number; height: number; };

export interface IInputCanvas extends ICanvas {
    onZoomIn(listener: ZoomInListener): VoidUnsubscribe;
    onZoomOut(listener: ZoomOutListener): VoidUnsubscribe;

    onPointerMove(listener: PointerMoveListener): VoidUnsubscribe;
    onPointerUp(listener: PointerUpListener): VoidUnsubscribe;
    onPointerHoldingDown(listener: PointerDownListener): VoidUnsubscribe;

    onSizeChange(listener: SizeChangeListener): VoidUnsubscribe;
    onVisibleAreaChange(listener: VisibleAreaChangeListener): VoidUnsubscribe;
}

export interface ITouchInput extends IDisposable {
    get inZoomMode(): boolean;

    onZoomIn(listener: ZoomInListener): VoidUnsubscribe;
    onZoomOut(listener: ZoomOutListener): VoidUnsubscribe
}

export enum CanvasEventsType {
    WheelChange = "wheel",
    ZoomIn = "zoomin",
    ZoomOut = "zoomout",
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

export type VisibleAreaChangeEvent = { area: VisibleArea };
export type VisibleAreaChangeListener = Listener<VisibleAreaChangeEvent>;

export type PointerEventHandler = Listener<PointerEvent>;
export type TouchEventHandler = Listener<TouchEvent>;
export type WheelChangeHandler = Listener<WheelEvent>;