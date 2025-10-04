import React from 'react';
import { motion } from 'framer-motion';
import { getSpaceIcon, getSpaceColor } from '../../utils/spiralMath';
import type { SpaceConfig, TeamColor, Team } from '../../types/game.types';

interface BoardSpaceProps {
  space: SpaceConfig;
  teams: Record<TeamColor, Team>;
  isCurrentPosition?: boolean;
  isHighlighted?: boolean;
  onClick?: (position: number) => void;
  className?: string;
}

const BoardSpace: React.FC<BoardSpaceProps> = ({
  space,
  teams,
  isCurrentPosition = false,
  isHighlighted = false,
  onClick,
  className = '',
}) => {
  const { position, type, x, y } = space;
  const spaceIcon = getSpaceIcon(type);
  const spaceColor = getSpaceColor(type);
  const isSpecial = type !== 'normal';

  // Get teams on this space
  const teamsOnSpace = Object.values(teams).filter(team => team.position === position);
  const isOccupied = teamsOnSpace.length > 0;

  const handleClick = () => {
    if (onClick) {
      onClick(position);
    }
  };

  const spaceVariants = {
    default: {
      scale: 1,
      opacity: 1,
    },
    hover: {
      scale: 1.1,
      transition: { duration: 0.2 },
    },
    highlighted: {
      scale: 1.15,
      boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)',
    },
    special: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <g className={className}>
      {/* Space Circle */}
      <motion.circle
        cx={x}
        cy={y}
        r="20"
        fill={isSpecial ? spaceColor : '#FFFFFF'}
        stroke={isCurrentPosition ? '#8B5CF6' : isSpecial ? '#374151' : '#D1D5DB'}
        strokeWidth={isCurrentPosition ? 3 : 2}
        className="cursor-pointer"
        onClick={handleClick}
        variants={spaceVariants}
        initial="default"
        animate={
          isHighlighted ? 'highlighted' :
          isSpecial ? 'special' : 'default'
        }
        whileHover="hover"
        style={{
          filter: isCurrentPosition 
            ? 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))' 
            : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
        }}
      />

      {/* Space Number */}
      <text
        x={x}
        y={y - 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs font-bold pointer-events-none"
        fill={isSpecial ? '#FFFFFF' : '#374151'}
      >
        {position}
      </text>

      {/* Special Space Icon */}
      {isSpecial && spaceIcon && (
        <text
          x={x}
          y={y + 8}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs pointer-events-none"
        >
          {spaceIcon}
        </text>
      )}

      {/* Team Indicators */}
      {isOccupied && (
        <g>
          {teamsOnSpace.map((team, index) => {
            const teamColors = {
              red: '#EF4444',
              blue: '#3B82F6',
              green: '#10B981',
              yellow: '#F59E0B',
            };

            const indicatorX = x + (index - (teamsOnSpace.length - 1) / 2) * 8;
            const indicatorY = y + 28;

            return (
              <motion.circle
                key={team.color}
                cx={indicatorX}
                cy={indicatorY}
                r="4"
                fill={teamColors[team.color]}
                stroke="#FFFFFF"
                strokeWidth="1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                }}
                className="pointer-events-none"
              />
            );
          })}
        </g>
      )}

      {/* Finish Line Special Effect */}
      {position === 50 && (
        <motion.circle
          cx={x}
          cy={y}
          r="25"
          fill="none"
          stroke="#FFD700"
          strokeWidth="2"
          strokeDasharray="5,5"
          className="pointer-events-none"
          animate={{
            strokeDashoffset: [0, -10],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Accessibility */}
      <title>
        Space {position}
        {isSpecial && ` - ${space.effect}`}
        {isOccupied && ` - Occupied by ${teamsOnSpace.map(t => t.name).join(', ')}`}
      </title>
    </g>
  );
};

export default React.memo(BoardSpace);
