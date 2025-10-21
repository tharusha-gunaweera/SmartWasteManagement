// Remove problematic mocks and use simpler setup
import 'react-native-gesture-handler/jestSetup';

// Mock React Native - use simpler approach
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({
  default: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
}));

// Mock Expo modules
jest.mock('expo-location', () => ({}));
jest.mock('expo-font', () => ({}));
jest.mock('expo-constants', () => ({}));
jest.mock('expo-haptics', () => ({}));
jest.mock('expo-splash-screen', () => ({}));

// Mock Firebase
jest.mock('@react-native-firebase/app', () => ({
  app: jest.fn(),
}));

jest.mock('@react-native-firebase/auth', () => ({
  auth: jest.fn(() => ({
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    updateProfile: jest.fn(),
    currentUser: null,
  })),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  firestore: jest.fn(() => ({
    collection: jest.fn(),
    doc: jest.fn(),
    setDoc: jest.fn(),
    getDocs: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    serverTimestamp: jest.fn(),
    Timestamp: {
      fromDate: jest.fn(),
    },
  })),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock React Native Maps with simpler approach
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const MockMapView = React.forwardRef((props: any, ref: any) => 
    React.createElement(View, { ...props, ref, testID: 'map-view' })
  );
  
  const MockMarker = (props: any) => 
    React.createElement(View, { ...props, testID: 'map-marker' });
  
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    PROVIDER_GOOGLE: 'google',
  };
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// Mock React Native Vector Icons
jest.mock('react-native-vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Silence warning logs in tests but keep actual errors
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.warn = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
    return;
  }
  originalConsoleWarn(...args);
};

console.error = (...args: any[]) => {
  if (typeof args[0] === 'string' && 
      (args[0].includes('Warning:') || args[0].startsWith('ERROR:'))) {
    return;
  }
  originalConsoleError(...args);
};