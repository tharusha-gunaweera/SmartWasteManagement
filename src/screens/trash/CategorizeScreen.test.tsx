import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import CategorizeScreen from './CategorizeScreen';

// Mock the service modules at the module level
jest.mock('../../services/trash/TrashService', () => {
  return {
    TrashService: jest.fn().mockImplementation(() => ({
      getUserTrashItems: jest.fn(),
      getUserTrashStats: jest.fn(),
      addTrashToBucket: jest.fn(),
      deleteTrashItem: jest.fn(),
      getTrashTypeIcon: jest.fn((type: string) => {
        switch (type) {
          case 'organic': return '🍎';
          case 'recyclable': return '♻️';
          case 'non-recyclable': return '🚫';
          default: return '🗑️';
        }
      }),
      getTrashTypeColor: jest.fn((type: string) => {
        switch (type) {
          case 'organic': return '#4CAF50';
          case 'recyclable': return '#2196F3';
          case 'non-recyclable': return '#F44336';
          default: return '#9E9E9E';
        }
      }),
      getTrashTypeName: jest.fn((type: string) => {
        switch (type) {
          case 'organic': return 'Organic Waste';
          case 'recyclable': return 'Recyclable';
          case 'non-recyclable': return 'Non-Recyclable';
          default: return 'Unknown';
        }
      }),
    })),
  };
});

jest.mock('../../services/bucket/BucketService', () => {
  const mockInstance = {
    getUserBuckets: jest.fn(),
    createBucket: jest.fn(),
    updateBucketFillPercentage: jest.fn(),
    updateBucketHealth: jest.fn(),
    assignDriver: jest.fn(),
    getAvailableDrivers: jest.fn(),
    createTechnicianRequest: jest.fn(),
    getAllTechnicianRequests: jest.fn(),
    updateTechnicianRequestStatus: jest.fn(),
    deleteBucket: jest.fn(),
    isBucketIdUnique: jest.fn(),
  };

  return {
    BucketService: {
      getInstance: jest.fn(() => mockInstance),
      clearInstance: jest.fn(),
    },
  };
});

jest.mock('../../services/auth/AuthService', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => ({
      getCurrentUser: jest.fn(),
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updateUserAccessLevel: jest.fn(),
      getCurrentUserWithLocalStorage: jest.fn(),
    })),
  };
});

// Import after mocking
import { AuthService } from '../../services/auth/AuthService';
import { BucketService } from '../../services/bucket/BucketService';
import { TrashService } from '../../services/trash/TrashService';

// Get the mock instances
const MockTrashService = TrashService as jest.MockedClass<typeof TrashService>;
const MockBucketService = BucketService as typeof BucketService & {
  getInstance: jest.Mock;
  clearInstance: jest.Mock;
};
const MockAuthService = AuthService as jest.MockedClass<typeof AuthService>;

describe('CategorizeScreen', () => {
  // Create mock navigation with all required properties
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn(),
    pop: jest.fn(),
    replace: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
    dispatch: jest.fn(),
    isFocused: jest.fn(() => true),
    addListener: jest.fn((event: string, callback: any) => {
      if (event === 'focus') callback();
      return jest.fn();
    }),
    removeListener: jest.fn(),
    getState: jest.fn(() => ({
      index: 0,
      routes: [{ name: 'Categorize' }],
      key: 'stack-key',
      routeNames: ['Categorize'],
      type: 'stack' as const,
      stale: false,
    })),
    getParent: jest.fn(),
    canGoBack: jest.fn(() => true),
    getId: jest.fn(() => 'test-id'),
    preload: jest.fn(),
  };

  const mockRoute = {
    key: 'categorize-key',
    name: 'Categorize' as const,
    params: {},
  };

  const mockBuckets = [
    {
      id: 'bucket1',
      name: 'Test Bucket 1',
      bucketId: '123456',
      userId: 'user123',
      fillPercentage: 50,
      capacity: 100,
      location: 'Location 1',
      createdAt: new Date(),
      lastUpdated: new Date(),
      isAssigned: false,
      sensorUptime: 95,
      batteryLevel: 80,
      signalStrength: 4,
      isOnline: true,
      lastMaintenance: new Date()
    }
  ];

  const mockTrashItems = [
    {
      id: 'trash1',
      bucketId: 'bucket1',
      bucketName: 'Test Bucket 1',
      userId: 'user123',
      userName: 'Test User',
      trashType: 'organic' as const,
      weight: 1,
      description: 'Food waste',
      createdAt: new Date(),
      status: 'added' as const
    }
  ];

  const mockUser = {
    uid: 'user123',
    email: 'test@example.com',
    displayName: 'Test User',
    accessLevel: 1,
    createdAt: new Date()
  };

  // Mock instances
  let mockTrashInstance: any;
  let mockBucketInstance: any;
  let mockAuthInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create fresh mock instances
    mockTrashInstance = {
      getUserTrashItems: jest.fn().mockResolvedValue(mockTrashItems),
      getUserTrashStats: jest.fn().mockResolvedValue({
        totalTrash: 1,
        organic: 1,
        recyclable: 0,
        nonRecyclable: 0,
        lastUpdated: new Date()
      }),
      addTrashToBucket: jest.fn().mockResolvedValue('new-trash-id'),
      deleteTrashItem: jest.fn(),
      getTrashTypeIcon: jest.fn((type: string) => {
        switch (type) {
          case 'organic': return '🍎';
          case 'recyclable': return '♻️';
          case 'non-recyclable': return '🚫';
          default: return '🗑️';
        }
      }),
      getTrashTypeColor: jest.fn((type: string) => {
        switch (type) {
          case 'organic': return '#4CAF50';
          case 'recyclable': return '#2196F3';
          case 'non-recyclable': return '#F44336';
          default: return '#9E9E9E';
        }
      }),
      getTrashTypeName: jest.fn((type: string) => {
        switch (type) {
          case 'organic': return 'Organic Waste';
          case 'recyclable': return 'Recyclable';
          case 'non-recyclable': return 'Non-Recyclable';
          default: return 'Unknown';
        }
      }),
    };

    mockBucketInstance = {
      getUserBuckets: jest.fn().mockResolvedValue(mockBuckets),
      createBucket: jest.fn(),
      updateBucketFillPercentage: jest.fn(),
      updateBucketHealth: jest.fn(),
      assignDriver: jest.fn(),
      getAvailableDrivers: jest.fn(),
      createTechnicianRequest: jest.fn(),
      getAllTechnicianRequests: jest.fn(),
      updateTechnicianRequestStatus: jest.fn(),
      deleteBucket: jest.fn(),
      isBucketIdUnique: jest.fn(),
    };

    mockAuthInstance = {
      getCurrentUser: jest.fn().mockReturnValue(mockUser),
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updateUserAccessLevel: jest.fn(),
      getCurrentUserWithLocalStorage: jest.fn(),
    };

    // Setup the mock implementations
    (MockTrashService as jest.Mock).mockImplementation(() => mockTrashInstance);
    MockBucketService.getInstance.mockReturnValue(mockBucketInstance);
    (MockAuthService as jest.Mock).mockImplementation(() => mockAuthInstance);
  });

  const renderComponent = () => {
    return render(
      <CategorizeScreen 
        navigation={mockNavigation as any}
      />
    );
  };

  it('should display trash statistics correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Your Trash Statistics')).toBeTruthy();
      expect(screen.getByText('1')).toBeTruthy(); // Total items
      expect(screen.getByText('1')).toBeTruthy(); // Organic items
    });

    expect(mockTrashInstance.getUserTrashStats).toHaveBeenCalledWith('user123');
  });

  it('should show empty state when no trash items', async () => {
    mockTrashInstance.getUserTrashItems.mockResolvedValue([]);
    mockTrashInstance.getUserTrashStats.mockResolvedValue({
      totalTrash: 0,
      organic: 0,
      recyclable: 0,
      nonRecyclable: 0,
      lastUpdated: new Date()
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No trash items yet')).toBeTruthy();
    });
  });

  it('should display recent trash items', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Recent Trash Items')).toBeTruthy();
      expect(screen.getByText('Organic Waste')).toBeTruthy();
    });
  });

  it('should handle add trash button press', async () => {
    renderComponent();

    await waitFor(() => {
      fireEvent.press(screen.getByText('Add Trash'));
    });

    expect(mockBucketInstance.getUserBuckets).toHaveBeenCalledWith('user123');
  });

  it('should show alert when no buckets available', async () => {
    mockBucketInstance.getUserBuckets.mockResolvedValue([]);
    
    // Mock alert
    const mockAlert = jest.spyOn(global, 'alert').mockImplementation();

    renderComponent();

    await waitFor(() => {
      fireEvent.press(screen.getByText('Add Trash'));
    });

    expect(mockAlert).toHaveBeenCalledWith(
      'No Buckets',
      'Please create a bucket first before adding trash.'
    );

    mockAlert.mockRestore();
  });

  it('should use singleton pattern correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(MockBucketService.getInstance).toHaveBeenCalled();
    });

    // Verify singleton is used
    expect(MockBucketService.getInstance).toHaveReturnedWith(mockBucketInstance);
  });
});