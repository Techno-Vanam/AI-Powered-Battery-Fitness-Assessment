/**
 * Jump Finite State Machine
 * Handles state transitions and rules for jump phase detection.
 */

import { JumpState } from '../types/jump';

export interface StateMachineContext {
  currentState: JumpState;
  stateStartTimeMs: number;
  hipVelocityY: number; // Positive upwards in image space (y inverted)
  isFeetOnGround: boolean;
  landingStableDurationMs: number;
}

export class JumpStateMachine {
  private state: JumpState = 'IDLE';
  private stateStartTimeMs: number = 0;
  private landingStableStartTimeMs: number | null = null;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.state = 'IDLE';
    this.stateStartTimeMs = Date.now();
    this.landingStableStartTimeMs = null;
  }

  public getState(): JumpState {
    return this.state;
  }

  public transitionTo(newState: JumpState): void {
    this.state = newState;
    this.stateStartTimeMs = Date.now();
  }

  /**
   * Evaluates state machine rules per frame update
   */
  public update(context: {
    timestampMs: number;
    hipVelocityY: number; // upward velocity
    feetOnGround: boolean;
    standingReachCaptured: boolean;
  }): JumpState {
    const now = context.timestampMs;
    const timeInState = now - this.stateStartTimeMs;

    switch (this.state) {
      case 'IDLE':
        if (context.standingReachCaptured) {
          this.transitionTo('READY');
        }
        break;

      case 'READY':
        // Ready state - waiting for user or system trigger countdown
        break;

      case 'COUNTDOWN':
        if (timeInState >= 3000) {
          // 3 second countdown finished
          this.transitionTo('TAKEOFF');
        }
        break;

      case 'TAKEOFF':
        // Detect sudden upward hip movement and feet leaving ground
        if (context.hipVelocityY > 0.15 || !context.feetOnGround) {
          this.transitionTo('AIRBORNE');
        }
        break;

      case 'AIRBORNE':
        // Hip velocity peaks near 0 at apex
        if (Math.abs(context.hipVelocityY) < 0.05) {
          this.transitionTo('PEAK');
        } else if (context.feetOnGround) {
          this.transitionTo('LANDING');
        }
        break;

      case 'PEAK':
        // Moving downward from peak
        if (context.hipVelocityY < -0.05 || context.feetOnGround) {
          this.transitionTo('LANDING');
        }
        break;

      case 'LANDING':
        // Detect landing stability (velocity ~ 0 for 500ms)
        if (Math.abs(context.hipVelocityY) < 0.03 && context.feetOnGround) {
          if (this.landingStableStartTimeMs === null) {
            this.landingStableStartTimeMs = now;
          } else if (now - this.landingStableStartTimeMs >= 500) {
            this.transitionTo('COMPLETE');
          }
        } else {
          this.landingStableStartTimeMs = null;
        }
        break;

      case 'COMPLETE':
      case 'INVALID':
        // Terminal states until reset
        break;
    }

    return this.state;
  }
}
