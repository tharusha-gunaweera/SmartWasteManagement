import { MapService } from './MapService';
import { getFirestore } from 'firebase/firestore';

jest.mock('firebase/firestore');

const MockedFirestore = getFirestore as jest.MockedFunction<typeof getFirestore>;

describe('MapService - Driver Map System', () => {
  let mapService: MapService;

  beforeEach(() => {
    mapService = new MapService();
    jest.clearAllMocks();
  });

  describe('getAllBinLocations', () => {
    it('should return all bin locations with correct status', async () => {
      // Arrange
      const mockBuckets = [
        {
          id: 'bucket1',
          data: () => ({
            name: 'Bin 1',
            bucketId: '123456',
            latitude: 6.9271,
            longitude: 79.8612,
            fillPercentage: 20,
            location: 'Location 1'
          })
        },
        {
          id: 'bucket2',
          data: () => ({
            name: 'Bin 2',
            bucketId: '123457',
            latitude: 6.9272,
            longitude: 79.8613,
            fillPercentage: 80,
            location: 'Location 2'
          })
        }
      ];

      const mockGetDocs = jest.fn().mockResolvedValue({
        forEach: (callback: any) => mockBuckets.forEach(callback)
      });

      MockedFirestore.mockReturnValue({
        collection: jest.fn(() => ({
          orderBy: jest.fn(() => ({ get: mockGetDocs }))
        }))
      } as any);

      // Act
      const locations = await mapService.getAllBinLocations();

      // Assert
      expect(locations).toHaveLength(2);
      expect(locations[0].status).toBe('low');
      expect(locations[1].status).toBe('full');
    });

    it('should handle empty bin locations', async () => {
      // Arrange
      const mockGetDocs = jest.fn().mockResolvedValue({
        forEach: (callback: any) => {} // No buckets
      });

      MockedFirestore.mockReturnValue({
        collection: jest.fn(() => ({
          orderBy: jest.fn(() => ({ get: mockGetDocs }))
        }))
      } as any);

      // Act
      const locations = await mapService.getAllBinLocations();

      // Assert
      expect(locations).toHaveLength(0);
    });

    it('should handle buckets without location data', async () => {
      // Arrange
      const mockBuckets = [
        {
          id: 'bucket1',
          data: () => ({
            name: 'Bin 1',
            bucketId: '123456',
            // Missing latitude and longitude
            fillPercentage: 50,
            location: 'Location 1'
          })
        }
      ];

      const mockGetDocs = jest.fn().mockResolvedValue({
        forEach: (callback: any) => mockBuckets.forEach(callback)
      });

      MockedFirestore.mockReturnValue({
        collection: jest.fn(() => ({
          orderBy: jest.fn(() => ({ get: mockGetDocs }))
        }))
      } as any);

      // Act
      const locations = await mapService.getAllBinLocations();

      // Assert
      expect(locations).toHaveLength(0); // Should filter out buckets without location
    });
  });

  describe('markBinAsCollected', () => {
    it('should reset bin fill percentage after collection', async () => {
      // Arrange
      const bucketId = 'bucket123';
      const mockUpdateDoc = jest.fn().mockResolvedValue(undefined);

      MockedFirestore.mockReturnValue({
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({ update: mockUpdateDoc }))
        }))
      } as any);

      // Act
      await mapService.markBinAsCollected(bucketId);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith({
        fillPercentage: 0,
        lastUpdated: expect.anything()
      });
    });

    it('should handle errors during bin collection', async () => {
      // Arrange
      const bucketId = 'bucket123';
      const mockUpdateDoc = jest.fn().mockRejectedValue(new Error('Update failed'));

      MockedFirestore.mockReturnValue({
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({ update: mockUpdateDoc }))
        }))
      } as any);

      // Act & Assert
      await expect(mapService.markBinAsCollected(bucketId))
        .rejects.toThrow('Failed to mark bin as collected');
    });
  });

  describe('collection requests', () => {
    it('should create collection request successfully', async () => {
      // Arrange
      const requestData = {
        bucketId: 'bucket123',
        bucketName: 'Test Bin',
        driverId: 'driver123',
        driverName: 'Test Driver',
        location: {
          latitude: 6.9271,
          longitude: 79.8612,
          address: 'Test Location'
        },
        status: 'pending' as const,
        requestedAt: new Date(),
        collectedAt: undefined
      };

      const mockSetDoc = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn(() => ({ set: mockSetDoc }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));

      MockedFirestore.mockReturnValue({
        collection: mockCollection
      } as any);

      // Act
      const result = await mapService.createCollectionRequest(requestData);

      // Assert
      expect(mockCollection).toHaveBeenCalledWith('collectionRequests');
      expect(typeof result).toBe('string');
    });

    it('should handle collection request creation errors', async () => {
      // Arrange
      const requestData = {
        bucketId: 'bucket123',
        bucketName: 'Test Bin',
        driverId: 'driver123',
        driverName: 'Test Driver',
        location: {
          latitude: 6.9271,
          longitude: 79.8612
        },
        status: 'pending' as const,
        requestedAt: new Date()
      };

      const mockCollection = jest.fn(() => {
        throw new Error('Firestore error');
      });

      MockedFirestore.mockReturnValue({
        collection: mockCollection
      } as any);

      // Act & Assert
      await expect(mapService.createCollectionRequest(requestData))
        .rejects.toThrow('Failed to create collection request');
    });
  });
});