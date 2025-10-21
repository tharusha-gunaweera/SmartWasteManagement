// Complete setup for SERVICE tests
import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage PROPERLY
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    mergeItem: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
    multiMerge: jest.fn(),
  },
}));

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

// Mock Firebase web SDK
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
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
  enableIndexedDbPersistence: jest.fn(),
  Timestamp: {
    fromDate: jest.fn(),
  },
}));

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
}));

// Silence warning logs
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.warn = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
    return;
  }
  originalConsoleWarn(...args);
};

console.error = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
    return;
  }
  originalConsoleError(...args);
};