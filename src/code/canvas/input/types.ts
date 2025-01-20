import { ICanvas, Size } from "../types";
import { Listener, VoidUnsubscribe } from "../../types";

export type CanvasEvent = { type: CanvasEventType, value?: Position };

export interface IInputCanvas extends ICanvas {
    onZoomIn(listener: ZoomInListener): VoidUnsubscribe;
    onZoomOut(listener: ZoomOutListener): VoidUnsubscribe;
    onSizeChange(listener: SizeChangeListener): VoidUnsubscribe;
    onMouseMove(listener: MouseMoveListener): VoidUnsubscribe;
    onMouseLeftButtonDown(listener: MouseLeftButtonDownListener): VoidUnsubscribe;
}

export enum HtmlCanvasEvents {
    WheelChange = "wheel",
    MouseDown = "mousedown",
    MouseMove = "mousemove",
}

export enum CanvasEventType {
    ZoomIn = "zoom-in",
    ZoomOut = "zoom-out",
    MouseMove = "mouse-move",
    MouseLeftButtonDown = "mouse-left-button-down"
}

export type WheelEvent = { deltaY: number };
export type WheelListener = Listener<WheelEvent>;

export type MouseMoveEvent = { position: Position };
export type MouseMoveListener = Listener<MouseMoveEvent>;

export type MouseButtonDownEvent = { position: Position } & { button: number };
export type MouseButtonDownListener = Listener<MouseButtonDownEvent>;

export type SizeChangeEvent = Size;
export type SizeChangeListener = Listener<Size>;

export type Position = { x: number, y: number };
export type PositionEvent = { position: Position };

export type MouseLeftButtonDownEvent = PositionEvent;
export type MouseLeftButtonDownListener = Listener<MouseLeftButtonDownEvent>;

export type ZoomInEvent = {};
export type ZoomInListener = Listener<ZoomInEvent>;

export type ZoomOutEvent = {};
export type ZoomOutListener = Listener<ZoomOutEvent>;

export type MouseEventHandler = (event: MouseEvent) => void
export type WheelChangeHandler = (event: WheelEvent) => void;