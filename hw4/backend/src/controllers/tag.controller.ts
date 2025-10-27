// Tag controller - handles HTTP requests for tags
import type { Request, Response } from 'express';
import { tagService } from '../services/tag.service';
import { HttpStatus } from '../utils/httpStatus';

export class TagController {
  /**
   * GET /api/tags
   * Get all tags for the current user
   */
  async getAllTags(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const tags = await tagService.getAllTags((req as any).user.userId, req.query);

    res.json({
      success: true,
      count: tags.length,
      data: tags,
    });
  }

  /**
   * GET /api/tags/:name
   * Get tag by name
   */
  async getTagByName(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const tag = await tagService.getTagByName(req.params.name, (req as any).user.userId);

    res.json({
      success: true,
      data: tag,
    });
  }

  /**
   * POST /api/tags
   * Create a new tag
   */
  async createTag(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const tag = await tagService.createTag(req.body, (req as any).user.userId);

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Tag created successfully',
      data: tag,
    });
  }

  /**
   * PATCH /api/tags/:name
   * Update a tag
   */
  async updateTag(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const tag = await tagService.updateTag(req.params.name, req.body, (req as any).user.userId);

    res.json({
      success: true,
      message: 'Tag updated successfully',
      data: tag,
    });
  }

  /**
   * DELETE /api/tags/:name
   * Delete a tag (validates place invariant)
   */
  async deleteTag(req: Request, res: Response) {
    if (!(req as any).user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    await tagService.deleteTag(req.params.name, (req as any).user.userId);

    res.json({
      success: true,
      message: 'Tag deleted successfully',
    });
  }
}

// Singleton instance
export const tagController = new TagController();

