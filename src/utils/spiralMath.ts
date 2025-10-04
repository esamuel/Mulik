import type { SpaceConfig } from '../types/game.types';

/**
 * Calculate positions for spaces arranged in an Archimedean spiral
 */
export const calculateSpiralPositions = (
  numSpaces: number,
  centerX: number,
  centerY: number,
  maxRadius: number
): SpaceConfig[] => {
  const spaces: SpaceConfig[] = [];
  
  // Spiral parameters
  const totalAngle = 4 * Math.PI; // 2 full rotations
  const angleStep = totalAngle / (numSpaces - 1);
  const radiusStep = maxRadius / (numSpaces - 1);
  
  for (let i = 0; i < numSpaces; i++) {
    const angle = i * angleStep;
    const radius = i * radiusStep;
    
    // Calculate position using Archimedean spiral formula
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    const position = i + 1; // 1-indexed positions
    const type = getSpaceType(position);
    
    spaces.push({
      position,
      x,
      y,
      type,
      effect: getSpaceEffect(type),
    });
  }
  
  return spaces;
};

/**
 * Determine the type of space based on position
 */
export const getSpaceType = (position: number): SpaceConfig['type'] => {
  // Finish line
  if (position === 50) return 'bonus';
  
  // Lightning Round spaces
  if ([15, 30, 45].includes(position)) return 'lightning';
  
  // Switch Square spaces
  if ([10, 20, 35, 44].includes(position)) return 'switch';
  
  // Steal spaces
  if ([12, 25, 38].includes(position)) return 'steal';
  
  // Bonus Circle spaces
  if ([8, 16, 24, 32, 40, 48].includes(position)) return 'bonus';
  
  return 'normal';
};

/**
 * Get the effect description for a space type
 */
export const getSpaceEffect = (type: SpaceConfig['type']): string => {
  switch (type) {
    case 'bonus':
      return 'Bonus points or extra turn';
    case 'lightning':
      return 'Lightning round - quick answers';
    case 'switch':
      return 'Switch positions with another team';
    case 'steal':
      return 'Steal points from another team';
    default:
      return 'Normal space';
  }
};

/**
 * Get the icon for a space type
 */
export const getSpaceIcon = (type: SpaceConfig['type']): string => {
  switch (type) {
    case 'bonus':
      return '⭐';
    case 'lightning':
      return '⚡';
    case 'switch':
      return '🔄';
    case 'steal':
      return '🎯';
    default:
      return '';
  }
};

/**
 * Get the color for a space type
 */
export const getSpaceColor = (type: SpaceConfig['type']): string => {
  switch (type) {
    case 'bonus':
      return '#FFD700'; // Gold
    case 'lightning':
      return '#3B82F6'; // Electric blue
    case 'switch':
      return '#8B5CF6'; // Purple
    case 'steal':
      return '#EF4444'; // Red
    default:
      return '#F3F4F6'; // Light gray
  }
};

/**
 * Calculate distance between two positions on the spiral
 */
export const calculateDistance = (from: number, to: number): number => {
  return Math.abs(to - from);
};

/**
 * Get the next position after moving a certain number of spaces
 */
export const getNextPosition = (currentPosition: number, spaces: number): number => {
  const newPosition = currentPosition + spaces;
  return Math.min(newPosition, 50); // Can't go beyond position 50
};

/**
 * Check if a position is a special space
 */
export const isSpecialSpace = (position: number): boolean => {
  return getSpaceType(position) !== 'normal';
};

/**
 * Get all special spaces of a specific type
 */
export const getSpecialSpaces = (type: SpaceConfig['type']): number[] => {
  const spaces: number[] = [];
  
  for (let i = 1; i <= 50; i++) {
    if (getSpaceType(i) === type) {
      spaces.push(i);
    }
  }
  
  return spaces;
};

/**
 * Calculate the angle for a given position on the spiral
 */
export const getPositionAngle = (position: number, totalSpaces: number = 50): number => {
  const totalAngle = 4 * Math.PI; // 2 full rotations
  return ((position - 1) / (totalSpaces - 1)) * totalAngle;
};

/**
 * Calculate the radius for a given position on the spiral
 */
export const getPositionRadius = (position: number, maxRadius: number, totalSpaces: number = 50): number => {
  return ((position - 1) / (totalSpaces - 1)) * maxRadius;
};
