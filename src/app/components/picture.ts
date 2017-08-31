/**
 * Import decorators and services from angular
 */
import {
    AfterContentChecked,
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
    ViewChild
} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
/**
 * Import the ngrx configured store
 */
import {Store} from "@ngrx/store";
import {AppState} from "../store/appState.store";
import {LayerMode, LayerModeType} from "../models/Picture";

@Component({
    selector: 'picture',
    template: `
        <div #canvas></div>`
})
export default class PictureComponent implements OnInit, AfterViewInit, AfterContentChecked, OnChanges {
    @Input()
    url: string;

    @Input()
    mode: LayerMode;

    @ViewChild('canvas') d1: ElementRef;

    name: string;
    canvas: HTMLCanvasElement;
    image: HTMLImageElement;

    messageForm = new FormGroup({
        messageText: new FormControl('Angular2'),
    });

    constructor(public store: Store<AppState>) {
    }

    ngOnInit() {
        this.image = document.createElement('img');
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['url']) {
            this.reloadImage();
        } else {
            this.updatePic();
        }
        console.log("Changes", changes);
    }

    reloadImage() {
        console.log("Reload happening");
        if (this.d1 && this.d1.nativeElement) {
            this.d1.nativeElement.innerHTML = '';
        }
        this.canvas = null;
        this.image = document.createElement('img');
        this.image.addEventListener('load', () => {
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.image.width;
            this.canvas.height = this.image.height;
            this.d1.nativeElement.innerHTML = '';
            this.d1.nativeElement.appendChild(this.canvas);

            this.updatePic();
        }, true);
        this.image.src = this.url;
    }

    ngAfterViewInit() {
        this.reloadImage();
    }

    threshold(threshold) {
        const ctx = this.canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];
            const v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) ? 255 : 0;
            d[i] = d[i + 1] = d[i + 2] = v;
        }
        ctx.putImageData(imgData, 0, 0);
    }
    
    threshold_i(threshold) {
        const ctx = this.canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];
            const v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) ? 0 : 255;
            d[i] = d[i + 1] = d[i + 2] = v;
        }
        ctx.putImageData(imgData, 0, 0);
    }

    grayscale() {
        const ctx = this.canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];
            const v = (0.2126 * r + 0.7152 * g + 0.0722 * b);
            d[i] = d[i + 1] = d[i + 2] = v;
        }
        ctx.putImageData(imgData, 0, 0);
    }

    invert() {
        const ctx = this.canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 1) {
            d[i] = 255 - d[i];
        }
        ctx.putImageData(imgData, 0, 0);
    }

    ngAfterContentChecked() {
        // this.updatePic();
    }

    updatePic() {
        if (this.canvas) {
            console.log("Update happening");
            const ctx = this.canvas.getContext('2d');
            ctx.drawImage(this.image, 0, 0);

            if (this.mode.grayscale) {
                this.grayscale();
            }

            if (this.mode.type === LayerModeType.THRESHOLD) {
                this.threshold(255 * this.mode.thresholdValue / 100);
            }

            if (this.mode.type === LayerModeType.THRESHOLD_INVERTED) {
                this.threshold_i(255 * this.mode.thresholdValue / 100);
            }
        }
    }
}
