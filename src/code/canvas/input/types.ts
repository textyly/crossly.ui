import { ICanvas, SizeChangeListener } from "../types";
import { Listener, VoidUnsubscribe } from "../../types";

export type CanvasEvent = { type: CanvasEventType, value?: Position };

export interface IInputCanvas extends ICanvas {
    onZoomIn(listener: ZoomInListener): VoidUnsubscribe;
    onZoomOut(listener: ZoomOutListener): VoidUnsubscribe;

    onMouseMove(listener: MouseMoveListener): VoidUnsubscribe;
    onMouseLeftButtonDown(listener: MouseLeftButtonDownListener): VoidUnsubscribe;
    onMouseLeftButtonUp(listener: MouseLeftButtonUpListener): VoidUnsubscribe;

    onSizeChange(listener: SizeChangeListener): VoidUnsubscribe;
}

export enum HtmlCanvasEvents {
    WheelChange = "wheel",
    MouseMove = "pointermove",
    MouseDown = "pointerdown",
    MouseUp = "pointerup",
}

export enum CanvasEventType {
    ZoomIn = "zoom-in",
    ZoomOut = "zoom-out",
    MouseMove = "mouse-move",
    MouseLeftButtonDown = "mouse-left-button-down",
    MouseLeftButtonUp = "mouse-left-button-up",
}

export type Position = { x: number, y: number };
export type PositionEvent = { position: Position };

export type WheelListener = Listener<WheelEvent>;
export type MouseMoveEvent = PositionEvent;
export type MouseMoveListener = Listener<MouseMoveEvent>;

export type MouseLeftButtonDownEvent = PositionEvent;
export type MouseLeftButtonDownListener = Listener<MouseLeftButtonDownEvent>;

export type MouseLeftButtonUpEvent = PositionEvent;
export type MouseLeftButtonUpListener = Listener<MouseLeftButtonUpEvent>;

export type ZoomInEvent = {};
export type ZoomInListener = Listener<ZoomInEvent>;

export type ZoomOutEvent = {};
export type ZoomOutListener = Listener<ZoomOutEvent>;

export type MouseEventHandler = Listener<MouseEvent>;
export type WheelChangeHandler = Listener<WheelEvent>;