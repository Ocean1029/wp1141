// Business logic for Segment operations
import { segmentRepository } from './segment.repository';
import { AppError } from '../../shared/errors/AppError';
import type { 
  CreateSegmentDto, 
  UpdateSegmentDto, 
  SegmentQueryDto,
  BulkCreateSegmentsDto,
  AssignThemeDto,
} from './segment.dto';

export class SegmentService {
  /**
   * Get all segments with optional filtering
   */
  async getAllSegments(query: SegmentQueryDto) {
    return segmentRepository.findAll(query);
  }

  /**
   * Get a single segment by ID
   */
  async getSegmentById(id: string) {
    const segment = await segmentRepository.findById(id);

    if (!segment) {
      throw new AppError('Segment not found', 404);
    }

    return segment;
  }

  /**
   * Get segments by diary ID
   */
  async getSegmentsByDiaryId(diaryId: string) {
    return segmentRepository.findByDiaryId(diaryId);
  }

  /**
   * Get segments by theme ID
   */
  async getSegmentsByThemeId(themeId: string) {
    return segmentRepository.findByThemeId(themeId);
  }

  /**
   * Create a new segment
   */
  async createSegment(data: CreateSegmentDto) {
    return segmentRepository.create(data);
  }

  /**
   * Bulk create segments for a diary
   */
  async bulkCreateSegments(data: BulkCreateSegmentsDto) {
    // Optional: Delete existing segments for the diary before creating new ones
    // This is useful when regenerating segments
    await segmentRepository.deleteByDiaryId(data.diaryId);

    return segmentRepository.bulkCreate(data);
  }

  /**
   * Update an existing segment
   */
  async updateSegment(id: string, data: UpdateSegmentDto) {
    // Check if segment exists
    const exists = await segmentRepository.exists(id);
    if (!exists) {
      throw new AppError('Segment not found', 404);
    }

    return segmentRepository.update(id, data);
  }

  /**
   * Assign or unassign theme to a segment
   */
  async assignTheme(id: string, data: AssignThemeDto) {
    // Check if segment exists
    const exists = await segmentRepository.exists(id);
    if (!exists) {
      throw new AppError('Segment not found', 404);
    }

    return segmentRepository.assignTheme(id, data.themeId);
  }

  /**
   * Delete a segment
   */
  async deleteSegment(id: string) {
    // Check if segment exists
    const exists = await segmentRepository.exists(id);
    if (!exists) {
      throw new AppError('Segment not found', 404);
    }

    await segmentRepository.delete(id);
  }

  /**
   * Delete all segments for a diary
   */
  async deleteSegmentsByDiaryId(diaryId: string) {
    const result = await segmentRepository.deleteByDiaryId(diaryId);
    return result;
  }
}

// Singleton instance
export const segmentService = new SegmentService();

