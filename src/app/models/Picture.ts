export enum LayerModeType {
    NORMAL = 'normal',
    THRESHOLD = 'threshold',
    THRESHOLD_INVERTED = 'threshold_inverted',
}

export class LayerMode {
    type: LayerModeType;
    blinking: boolean;
    blinkInterval: number;
    thresholdValue: number;
    grayscale: boolean;
}

export default class PictureLayer {
    path: string;
    mode: LayerMode;
}
