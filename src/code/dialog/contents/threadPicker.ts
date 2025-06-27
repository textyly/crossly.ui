import { DialogContentBase } from "./base.js";
import { IThreadPickerContent } from "../types.js";

export class ThreadPickerContent extends DialogContentBase implements IThreadPickerContent {
    private content: Element;
    private gradientGrid: Element;
    private canvas: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D;
    private slider: any;

    constructor(document: Document, dialogOverlay: HTMLElement) {
        super(ThreadPickerContent.name, document, dialogOverlay);

        this.content = this.getContent(dialogOverlay, "thread-picker-content");
        this.gradientGrid = this.content.querySelector("#thread-picker-gradient-grid")!;

        this.canvas = this.content.querySelector("#thread-picker-palette-canvas")! as HTMLCanvasElement;
        this.canvasContext = this.canvas.getContext("2d")!;
        this.slider = this.content.querySelector("#hue-slider")!;

        this.generateGrid();
        this.drawPalette(this.slider.value);
    }

    protected override showContent(): void {
        this.dialog.appendChild(this.content);
    }

    protected override hideContent(): void {
        this.dialog.removeChild(this.content);
    }

    private hslToHex(h: any, s: any, l: any): string {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = (n: any) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    private createSwatch(h: any, s: any, l: any): HTMLDivElement {
        const hex = this.hslToHex(h, s, l);
        const swatch = document.createElement('div');
        swatch.className = 'thread-picker-swatch';
        swatch.style.backgroundColor = hex;
        swatch.title = hex;

        // TODO:
        // swatch.addEventListener('click', () => {
        //     selectedColorText.textContent = hex;
        //     preview.style.backgroundColor = hex;
        // });

        return swatch;
    }

    private generateGrid(): void {
        const hueSteps = 8;
        const lightnessSteps = 8;

        for (let col = 0; col < hueSteps; col++) {
            const hue = Math.round((360 / hueSteps) * col);
            for (let row = 0; row < lightnessSteps; row++) {
                const lightness = 90 - row * (70 / (lightnessSteps - 1)); // from 90% to ~20%
                const swatch = this.createSwatch(hue, 100, lightness);
                this.gradientGrid.appendChild(swatch);
            }
        }
    }

    private drawPalette(hue: any): void {
        const width = this.canvas.width;
        const height = this.canvas.height;

        const baseColor = `hsl(${hue}, 100%, 50%)`;

        // Horizontal: saturation
        const satGrad = this.canvasContext.createLinearGradient(0, 0, width, 0);
        satGrad.addColorStop(0, 'white');
        satGrad.addColorStop(1, baseColor);
        this.canvasContext.fillStyle = satGrad;
        this.canvasContext.fillRect(0, 0, width, height);

        // Vertical: lightness
        const lightGrad = this.canvasContext.createLinearGradient(0, 0, 0, height);
        lightGrad.addColorStop(0, 'rgba(0,0,0,0)');
        lightGrad.addColorStop(1, 'black');
        this.canvasContext.fillStyle = lightGrad;
        this.canvasContext.fillRect(0, 0, width, height);
    }

    private pickColor(x: any, y: any): void {
        const imageData = this.canvasContext.getImageData(x, y, 1, 1).data;
        const [r, g, b] = imageData;
        const hex = `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')}`;
        // selectedColorText.textContent = hex;
        // preview.style.backgroundColor = hex;
    }
}