import { nextState } from './sitReachStateMachine';

test('state machine transitions from permission to camera initializing', () => {
  expect(nextState('PERMISSION', { type: 'permission_granted' })).toBe('CAMERA_INITIALIZING');
});

test('state machine goes to error on denied permission', () => {
  expect(nextState('PERMISSION', { type: 'permission_denied' })).toBe('ERROR');
});

test('state machine moves from model loading to setup validation', () => {
  expect(nextState('MODEL_LOADING', { type: 'model_ready' })).toBe('SETUP_VALIDATION');
});

test('state machine accepts trial hold to accepted', () => {
  expect(nextState('TRIAL_HOLDING', { type: 'trial_accept' })).toBe('TRIAL_ACCEPTED');
});
