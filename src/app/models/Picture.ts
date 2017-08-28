export enum LayerModeType {
    NORMAL = 'normal',
    THRESHOLD = 'threshold',
    THRESHOLD_INVERTED = 'threshold_inverted',
}

export interface LayerMode {
    type: LayerModeType;
    blinking: boolean;
    blinkInterval: number;
    thresholdValue: number;
    grayscale: boolean;
}

export interface PictureLayer {
    path: string;
    mode: LayerMode;
}
