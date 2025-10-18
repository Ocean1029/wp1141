// Business logic for Color operations
import { colorRepository } from './color.repository';
import { AppError } from '../../shared/errors/AppError';
import type { CreateColorDto, UpdateColorDto, ColorQueryDto } from './color.dto';

export class ColorService {
  /**
   * Get all colors with optional search
   */
  async getAllColors(query: ColorQueryDto) {
    return colorRepository.findAll(query);
  }

  /**
   * Get a single color by ID
   */
  async getColorById(id: number) {
    const color = await colorRepository.findById(id);

    if (!color) {
      throw new AppError('Color not found', 404);
    }

    return color;
  }

  /**
   * Create a new color
   */
  async createColor(data: CreateColorDto) {
    // Check if hex code already exists
    const hexCodeExists = await colorRepository.existsByHexCode(data.hexCode);
    if (hexCodeExists) {
      throw new AppError('Color with this hex code already exists', 409);
    }

    // Check if name already exists
    const nameExists = await colorRepository.existsByName(data.name);
    if (nameExists) {
      throw new AppError('Color with this name already exists', 409);
    }

    return colorRepository.create(data);
  }

  /**
   * Update an existing color
   */
  async updateColor(id: number, data: UpdateColorDto) {
    // Check if color exists
    const exists = await colorRepository.exists(id);
    if (!exists) {
      throw new AppError('Color not found', 404);
    }

    // If updating hex code, check for uniqueness
    if (data.hexCode) {
      const hexCodeExists = await colorRepository.existsByHexCode(data.hexCode, id);
      if (hexCodeExists) {
        throw new AppError('Color with this hex code already exists', 409);
      }
    }

    // If updating name, check for uniqueness
    if (data.name) {
      const nameExists = await colorRepository.existsByName(data.name, id);
      if (nameExists) {
        throw new AppError('Color with this name already exists', 409);
      }
    }

    return colorRepository.update(id, data);
  }

  /**
   * Delete a color
   */
  async deleteColor(id: number) {
    // Check if color exists
    const exists = await colorRepository.exists(id);
    if (!exists) {
      throw new AppError('Color not found', 404);
    }

    // Note: Themes will have their colorId set to null due to onDelete: SetNull
    await colorRepository.delete(id);
  }
}

// Singleton instance
export const colorService = new ColorService();

