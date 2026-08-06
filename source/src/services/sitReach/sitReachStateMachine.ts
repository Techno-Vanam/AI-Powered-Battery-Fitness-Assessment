export type SitReachState =
  | 'PERMISSION'
  | 'CAMERA_INITIALIZING'
  | 'CAMERA_READY'
  | 'MODEL_LOADING'
  | 'SETUP_VALIDATION'
  | 'CALIBRATION_REQUIRED'
  | 'READY'
  | 'TRIAL_ACTIVE'
  | 'TRIAL_HOLDING'
  | 'TRIAL_ACCEPTED'
  | 'WAITING_RESET'
  | 'COMPLETED'
  | 'ERROR';

export type SitReachEvent =
  | { type: 'permission_granted' }
  | { type: 'permission_denied' }
  | { type: 'camera_ready' }
  | { type: 'model_ready' }
  | { type: 'model_missing' }
  | { type: 'calibration_complete' }
  | { type: 'setup_valid' }
  | { type: 'setup_invalid' }
  | { type: 'trial_start' }
  | { type: 'trial_hold' }
  | { type: 'trial_accept' }
  | { type: 'trial_reset' }
  | { type: 'complete' }
  | { type: 'error'; message: string };

export function nextState(current: SitReachState, event: SitReachEvent): SitReachState {
  switch (current) {
    case 'PERMISSION':
      if (event.type === 'permission_granted') return 'CAMERA_INITIALIZING';
      if (event.type === 'permission_denied') return 'ERROR';
      break;
    case 'CAMERA_INITIALIZING':
      if (event.type === 'camera_ready') return 'MODEL_LOADING';
      if (event.type === 'error') return 'ERROR';
      break;
    case 'MODEL_LOADING':
      if (event.type === 'model_ready') return 'SETUP_VALIDATION';
      if (event.type === 'model_missing') return 'CALIBRATION_REQUIRED';
      if (event.type === 'error') return 'ERROR';
      break;
    case 'SETUP_VALIDATION':
      if (event.type === 'setup_valid') return 'READY';
      if (event.type === 'calibration_complete') return 'READY';
      break;
    case 'READY':
      if (event.type === 'trial_start') return 'TRIAL_ACTIVE';
      break;
    case 'TRIAL_ACTIVE':
      if (event.type === 'trial_hold') return 'TRIAL_HOLDING';
      break;
    case 'TRIAL_HOLDING':
      if (event.type === 'trial_accept') return 'TRIAL_ACCEPTED';
      break;
    case 'TRIAL_ACCEPTED':
      if (event.type === 'trial_reset') return 'WAITING_RESET';
      break;
    case 'WAITING_RESET':
      if (event.type === 'setup_valid') return 'READY';
      break;
    case 'COMPLETED':
      return 'COMPLETED';
    case 'ERROR':
      return 'ERROR';
  }

  return current;
}
