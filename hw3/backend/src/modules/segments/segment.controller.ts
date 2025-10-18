// Controller for handling Segment HTTP requests
import type { Request, Response } from 'express';
import { segmentService } from './segment.service';
import {
  createSegmentSchema,
  updateSegmentSchema,
  segmentQuerySchema,
  bulkCreateSegmentsSchema,
  assignThemeSchema,
} from './segment.dto';

export class SegmentController {
  /**
   * GET /api/segments
   * Get all segments with optional filtering
   */
  async getAllSegments(req: Request, res: Response) {
    const query = segmentQuerySchema.parse(req.query);
    const segments = await segmentService.getAllSegments(query);

    res.json({
      success: true,
      count: segments.length,
      data: segments,
    });
  }

  /**
   * GET /api/segments/:id
   * Get a single segment by ID
   */
  async getSegmentById(req: Request, res: Response) {
    const { id } = req.params;
    const segment = await segmentService.getSegmentById(id);

    res.json({
      success: true,
      data: segment,
    });
  }

  /**
   * GET /api/segments/diary/:diaryId
   * Get all segments for a specific diary
   */
  async getSegmentsByDiaryId(req: Request, res: Response) {
    const { diaryId } = req.params;
    const segments = await segmentService.getSegmentsByDiaryId(diaryId);

    res.json({
      success: true,
      count: segments.length,
      data: segments,
    });
  }

  /**
   * GET /api/segments/theme/:themeId
   * Get all segments for a specific theme
   */
  async getSegmentsByThemeId(req: Request, res: Response) {
    const { themeId } = req.params;
    const segments = await segmentService.getSegmentsByThemeId(themeId);

    res.json({
      success: true,
      count: segments.length,
      data: segments,
    });
  }

  /**
   * POST /api/segments
   * Create a new segment
   */
  async createSegment(req: Request, res: Response) {
    const data = createSegmentSchema.parse(req.body);
    const segment = await segmentService.createSegment(data);

    res.status(201).json({
      success: true,
      message: 'Segment created successfully',
      data: segment,
    });
  }

  /**
   * POST /api/segments/bulk
   * Bulk create segments for a diary
   */
  async bulkCreateSegments(req: Request, res: Response) {
    const data = bulkCreateSegmentsSchema.parse(req.body);
    const segments = await segmentService.bulkCreateSegments(data);

    res.status(201).json({
      success: true,
      message: `${segments.length} segments created successfully`,
      count: segments.length,
      data: segments,
    });
  }

  /**
   * PUT /api/segments/:id
   * Update an existing segment
   */
  async updateSegment(req: Request, res: Response) {
    const { id } = req.params;
    const data = updateSegmentSchema.parse(req.body);
    const segment = await segmentService.updateSegment(id, data);

    res.json({
      success: true,
      message: 'Segment updated successfully',
      data: segment,
    });
  }

  /**
   * PATCH /api/segments/:id/theme
   * Assign or unassign theme to a segment
   */
  async assignTheme(req: Request, res: Response) {
    const { id } = req.params;
    const data = assignThemeSchema.parse(req.body);
    const segment = await segmentService.assignTheme(id, data);

    res.json({
      success: true,
      message: data.themeId 
        ? 'Theme assigned successfully' 
        : 'Theme unassigned successfully',
      data: segment,
    });
  }

  /**
   * DELETE /api/segments/:id
   * Delete a segment
   */
  async deleteSegment(req: Request, res: Response) {
    const { id } = req.params;
    await segmentService.deleteSegment(id);

    res.json({
      success: true,
      message: 'Segment deleted successfully',
    });
  }

  /**
   * DELETE /api/segments/diary/:diaryId
   * Delete all segments for a diary
   */
  async deleteSegmentsByDiaryId(req: Request, res: Response) {
    const { diaryId } = req.params;
    const result = await segmentService.deleteSegmentsByDiaryId(diaryId);

    res.json({
      success: true,
      message: `${result.count} segments deleted successfully`,
      count: result.count,
    });
  }
}

// Singleton instance
export const segmentController = new SegmentController();

