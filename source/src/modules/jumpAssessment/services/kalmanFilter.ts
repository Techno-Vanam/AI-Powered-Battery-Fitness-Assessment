/**
 * 1D and 2D Kalman Filter implementation for landmark coordinate smoothing
 * Prevents jittering in video frame pose landmark detection.
 */

export class KalmanFilter1D {
  private processNoise: number; // Q
  private measurementNoise: number; // R
  private estimationError: number; // P
  private currentEstimate: number; // X

  constructor(processNoise = 1e-4, measurementNoise = 1e-2, estimationError = 1.0) {
    this.processNoise = processNoise;
    this.measurementNoise = measurementNoise;
    this.estimationError = estimationError;
    this.currentEstimate = 0;
  }

  public init(initialValue: number): void {
    this.currentEstimate = initialValue;
    this.estimationError = 1.0;
  }

  public update(measurement: number): number {
    // Prediction update
    this.estimationError = this.estimationError + this.processNoise;

    // Measurement update (Kalman Gain)
    const kalmanGain =
      this.estimationError / (this.estimationError + this.measurementNoise);
    this.currentEstimate =
      this.currentEstimate + kalmanGain * (measurement - this.currentEstimate);
    this.estimationError = (1 - kalmanGain) * this.estimationError;

    return this.currentEstimate;
  }

  public getEstimate(): number {
    return this.currentEstimate;
  }
}

export class KalmanFilter2D {
  private filterX: KalmanFilter1D;
  private filterY: KalmanFilter1D;

  constructor(processNoise = 1e-4, measurementNoise = 1e-2) {
    this.filterX = new KalmanFilter1D(processNoise, measurementNoise);
    this.filterY = new KalmanFilter1D(processNoise, measurementNoise);
  }

  public init(x: number, y: number): void {
    this.filterX.init(x);
    this.filterY.init(y);
  }

  public update(point: { x: number; y: number }): { x: number; y: number } {
    return {
      x: this.filterX.update(point.x),
      y: this.filterY.update(point.y),
    };
  }
}
