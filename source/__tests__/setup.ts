// react-native-background-fetch
jest.mock('react-native-background-fetch', () => ({
  configure: jest.fn(),
  scheduleTask: jest.fn(),
  finish: jest.fn(),
  registerHeadlessTask: jest.fn(),
  NETWORK_TYPE_ANY: 1,
  NETWORK_TYPE_NONE: 0,
}), { virtual: true });

// @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  default: {
    addEventListener: jest.fn(() => jest.fn()),
    fetch: jest.fn(async () => ({ isConnected: true, isInternetReachable: true })),
  },
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(async () => ({ isConnected: true, isInternetReachable: true })),
}), { virtual: true });

// react-native-fs
jest.mock('react-native-fs', () => ({
  exists: jest.fn(async () => true),
  unlink: jest.fn(async () => {}),
  DocumentDirectoryPath: '/mock/documents',
}), { virtual: true });

// react-native-sqlite-storage
jest.mock('react-native-sqlite-storage', () => ({
  enablePromise: jest.fn(),
  openDatabase: jest.fn(async () => ({
    executeSql: jest.fn(async () => [{ rows: { length: 1, item: () => ({ v: 2 }) } }]),
    transaction: jest.fn((cb: any) => cb({ executeSql: jest.fn() })),
    close: jest.fn(async () => {}),
  })),
}), { virtual: true });

// uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => `uuid-${Math.random().toString(36).slice(2)}`),
}), { virtual: true });

// axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(async () => ({ status: 200, data: {} })),
    post: jest.fn(async () => ({ status: 200, data: {} })),
    put: jest.fn(async () => ({ status: 200, data: {} })),
    delete: jest.fn(async () => ({ status: 200, data: {} })),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  })),
}), { virtual: true });

// react-native-permissions
jest.mock('react-native-permissions', () => ({
  check: jest.fn(async () => 'granted'),
  request: jest.fn(async () => 'granted'),
  PERMISSIONS: {
    ANDROID: { CAMERA: 'android.permission.CAMERA', RECORD_AUDIO: 'android.permission.RECORD_AUDIO' },
    IOS: { CAMERA: 'ios.permission.CAMERA', MICROPHONE: 'ios.permission.MICROPHONE' },
  },
  RESULTS: { GRANTED: 'granted' },
}), { virtual: true });

// react-native-vision-camera
jest.mock('react-native-vision-camera', () => ({
  Camera: () => null,
  useCameraDevice: jest.fn(() => ({ id: 'back', name: 'Back Camera' })),
  useCameraFormat: jest.fn(() => ({ videoWidth: 1280, videoHeight: 720 })),
  useCameraPermission: jest.fn(() => ({ hasPermission: true, requestPermission: jest.fn() })),
  useFrameProcessor: jest.fn(() => undefined),
  useCodeScanner: jest.fn(() => undefined),
  VisionCameraProxy: {
    initFrameProcessorPlugin: jest.fn(() => null),
  },
}), { virtual: true });

// react-native-fast-tflite (on-device pose — native module not available in Jest)
jest.mock('react-native-fast-tflite', () => ({
  useTensorflowModel: jest.fn(() => ({
    state: 'loaded',
    model: { runSync: jest.fn(() => [new Float32Array(51)]) },
  })),
}), { virtual: true });

// react-native-nitro-modules (peer dep for fast-tflite)
jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    box: jest.fn((model: unknown) => ({
      unbox: () => model,
    })),
  },
}), { virtual: true });

// vision-camera-resize-plugin
jest.mock('vision-camera-resize-plugin', () => ({
  useResizePlugin: jest.fn(() => ({
    resize: jest.fn(() => ({
      buffer: new Uint8Array(192 * 192 * 3),
      byteOffset: 0,
      byteLength: 192 * 192 * 3,
    })),
  })),
}), { virtual: true });

// react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  runOnJS: (fn: any) => (...args: any[]) => fn(...args),
  useSharedValue: jest.fn((initial: unknown) => ({ value: initial })),
}), { virtual: true });

// react-native-worklets-core (Vision Camera frame processors)
jest.mock('react-native-worklets-core', () => ({
  useRunOnJS: (fn: any) => fn,
  Worklets: {
    createRunOnJS: (fn: any) => fn,
  },
}), { virtual: true });

// @react-navigation/native & stack
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => children,
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
}), { virtual: true });

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: () => null,
  }),
}), { virtual: true });

// react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ children }: any) => React.createElement('Svg', null, children),
    Svg: ({ children }: any) => React.createElement('Svg', null, children),
    Polygon: (props: any) => React.createElement('Polygon', props),
    Circle: (props: any) => React.createElement('Circle', props),
    Rect: (props: any) => React.createElement('Rect', props),
    Line: (props: any) => React.createElement('Line', props),
    Text: (props: any) => React.createElement('Text', props),
  };
}, { virtual: true });

// lucide-react-native
jest.mock('lucide-react-native', () => {
  return new Proxy(
    {},
    {
      get: function (target, prop) {
        return () => null; // return a dummy component for any icon imported
      },
    }
  );
});

// @op-engineering/op-sqlite
jest.mock('@op-engineering/op-sqlite', () => ({
  open: jest.fn(() => ({
    execute: jest.fn(),
    executeSync: jest.fn(),
    close: jest.fn(),
  })),
}), { virtual: true });
