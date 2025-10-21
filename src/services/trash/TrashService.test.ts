import { TrashService } from './TrashService';
import { getFirestore } from 'firebase/firestore';
import { mockBucket, mockTrashItem, mockUser } from '../../test/test-utils';

jest.mock('firebase/firestore');

const MockedFirestore = getFirestore as jest.MockedFunction<typeof getFirestore>;

describe('TrashService - Categorization', () => {
  let trashService: TrashService;

  beforeEach(() => {
    trashService = new TrashService();
    jest.clearAllMocks();
  });

  describe('addTrashToBucket', () => {
    it('should successfully add organic trash to bucket', async () => {
      // Arrange
      const trashData = {
        bucketId: 'bucket123',
        bucketName: 'Test Bucket',
        userId: 'user123',
        userName: 'Test User',
        trashType: 'organic' as const,
        weight: 1.5,
        description: 'Food waste',
        createdAt: new Date(),
        status: 'added' as const
      };

      const mockSetDoc = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn(() => ({ set: mockSetDoc }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));

      MockedFirestore.mockReturnValue({
        collection: mockCollection
      } as any);

      // Act
      const result = await trashService.addTrashToBucket(trashData);

      // Assert
      expect(mockCollection).toHaveBeenCalledWith('trashes');
      expect(mockSetDoc).toHaveBeenCalled();
      expect(typeof result).toBe('string');
    });

    it('should throw error for invalid trash type', async () => {
      // Arrange
      const trashData = {
        bucketId: 'bucket123',
        bucketName: 'Test Bucket',
        userId: 'user123',
        userName: 'Test User',
        trashType: 'invalid-type' as any, // Invalid type
        weight: 1,
        description: 'Test trash',
        createdAt: new Date(),
        status: 'added' as const
      };

      // Act & Assert
      await expect(trashService.addTrashToBucket(trashData))
        .rejects.toThrow('Failed to add trash');
    });

    it('should handle Firestore connection errors', async () => {
      // Arrange
      const trashData = {
        bucketId: 'bucket123',
        bucketName: 'Test Bucket',
        userId: 'user123',
        userName: 'Test User',
        trashType: 'recyclable' as const,
        weight: 1,
        description: 'Plastic bottle',
        createdAt: new Date(),
        status: 'added' as const
      };

      const mockCollection = jest.fn(() => {
        throw new Error('Firestore connection failed');
      });

      MockedFirestore.mockReturnValue({
        collection: mockCollection
      } as any);

      // Act & Assert
      await expect(trashService.addTrashToBucket(trashData))
        .rejects.toThrow('Failed to add trash');
    });
  });

  describe('getUserTrashStats', () => {
    it('should calculate correct statistics for mixed trash types', async () => {
      // Arrange
      const mockTrashItems = [
        mockTrashItem({ trashType: 'organic' }),
        mockTrashItem({ trashType: 'organic' }),
        mockTrashItem({ trashType: 'recyclable' }),
        mockTrashItem({ trashType: 'non-recyclable' }),
        mockTrashItem({ trashType: 'recyclable' }),
      ];

      jest.spyOn(trashService, 'getUserTrashItems').mockResolvedValue(mockTrashItems);

      // Act
      const stats = await trashService.getUserTrashStats('user123');

      // Assert
      expect(stats.totalTrash).toBe(5);
      expect(stats.organic).toBe(2);
      expect(stats.recyclable).toBe(2);
      expect(stats.nonRecyclable).toBe(1);
    });

    it('should return zero statistics for user with no trash', async () => {
      // Arrange
      jest.spyOn(trashService, 'getUserTrashItems').mockResolvedValue([]);

      // Act
      const stats = await trashService.getUserTrashStats('user123');

      // Assert
      expect(stats.totalTrash).toBe(0);
      expect(stats.organic).toBe(0);
      expect(stats.recyclable).toBe(0);
      expect(stats.nonRecyclable).toBe(0);
    });

    it('should handle errors when fetching trash items', async () => {
      // Arrange
      jest.spyOn(trashService, 'getUserTrashItems').mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(trashService.getUserTrashStats('user123'))
        .rejects.toThrow('Failed to fetch trash statistics');
    });
  });

  describe('deleteTrashItem', () => {
    it('should successfully delete trash item', async () => {
      // Arrange
      const mockDeleteDoc = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn(() => ({ delete: mockDeleteDoc }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));

      MockedFirestore.mockReturnValue({
        collection: mockCollection
      } as any);

      // Act
      await trashService.deleteTrashItem('trash123');

      // Assert
      expect(mockCollection).toHaveBeenCalledWith('trashes');
      expect(mockDoc).toHaveBeenCalledWith('trash123');
      expect(mockDeleteDoc).toHaveBeenCalled();
    });

    it('should throw error when deleting non-existent trash item', async () => {
      // Arrange
      const mockDeleteDoc = jest.fn().mockRejectedValue(new Error('Document not found'));
      const mockDoc = jest.fn(() => ({ delete: mockDeleteDoc }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));

      MockedFirestore.mockReturnValue({
        collection: mockCollection
      } as any);

      // Act & Assert
      await expect(trashService.deleteTrashItem('non-existent-id'))
        .rejects.toThrow('Failed to delete trash item');
    });
  });

  describe('trash type helpers', () => {
    it('should return correct icon for each trash type', () => {
      expect(trashService.getTrashTypeIcon('organic')).toBe('🍎');
      expect(trashService.getTrashTypeIcon('recyclable')).toBe('♻️');
      expect(trashService.getTrashTypeIcon('non-recyclable')).toBe('🚫');
      expect(trashService.getTrashTypeIcon('unknown')).toBe('🗑️');
    });

    it('should return correct color for each trash type', () => {
      expect(trashService.getTrashTypeColor('organic')).toBe('#4CAF50');
      expect(trashService.getTrashTypeColor('recyclable')).toBe('#2196F3');
      expect(trashService.getTrashTypeColor('non-recyclable')).toBe('#F44336');
    });

    it('should return correct name for each trash type', () => {
      expect(trashService.getTrashTypeName('organic')).toBe('Organic Waste');
      expect(trashService.getTrashTypeName('recyclable')).toBe('Recyclable');
      expect(trashService.getTrashTypeName('non-recyclable')).toBe('Non-Recyclable');
    });
  });
});