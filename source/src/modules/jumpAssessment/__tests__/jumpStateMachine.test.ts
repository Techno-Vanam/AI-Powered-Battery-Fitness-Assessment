import { JumpStateMachine } from '../services/jumpStateMachine';

describe('Jump State Machine', () => {
  let stateMachine: JumpStateMachine;

  beforeEach(() => {
    stateMachine = new JumpStateMachine();
  });

  it('should start in IDLE state', () => {
    expect(stateMachine.getState()).toBe('IDLE');
  });

  it('should transition IDLE -> READY when standing reach captured', () => {
    const nextState = stateMachine.update({
      timestampMs: Date.now(),
      hipVelocityY: 0.0,
      feetOnGround: true,
      standingReachCaptured: true,
    });
    expect(nextState).toBe('READY');
  });

  it('should handle transition to TAKEOFF and AIRBORNE on upward hip velocity', () => {
    stateMachine.transitionTo('TAKEOFF');
    const nextState = stateMachine.update({
      timestampMs: Date.now(),
      hipVelocityY: 0.25, // upward speed
      feetOnGround: false, // airborne
      standingReachCaptured: true,
    });
    expect(nextState).toBe('AIRBORNE');
  });
});
