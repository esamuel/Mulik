import React from 'react';
import { motion } from 'framer-motion';
import type { TeamColor, SpaceConfig } from '../../types/game.types';

interface PawnProps {
  team: TeamColor;
  position: number;
  boardPositions: SpaceConfig[];
  isCurrentTurn?: boolean;
  isMoving?: boolean;
  className?: string;
}

const Pawn: React.FC<PawnProps> = ({
  team,
  position,
  boardPositions,
  isCurrentTurn = false,
  isMoving = false,
  className = '',
}) => {
  // Get the space configuration for current position
  const currentSpace = boardPositions.find(space => space.position === position);
  
  if (!currentSpace) {
    return null;
  }

  const { x, y } = currentSpace;

  // Team colors and emojis
  const teamConfig = {
    red: { color: '#EF4444', emoji: '🔴', name: 'Red' },
    blue: { color: '#3B82F6', emoji: '🔵', name: 'Blue' },
    green: { color: '#10B981', emoji: '🟢', name: 'Green' },
    yellow: { color: '#F59E0B', emoji: '🟡', name: 'Yellow' },
  };

  const config = teamConfig[team];

  // Animation variants
  const pawnVariants = {
    idle: {
      scale: 1,
      rotate: 0,
      y: 0,
    },
    currentTurn: {
      scale: [1, 1.1, 1],
      boxShadow: `0 0 20px ${config.color}`,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    moving: {
      scale: [1, 1.2, 1],
      rotate: [0, 360],
      y: [-5, 0],
      transition: {
        duration: 1,
        ease: 'easeInOut',
      },
    },
    landing: {
      scale: [1.2, 0.9, 1.1, 1],
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const getAnimationState = () => {
    if (isMoving) return 'moving';
    if (isCurrentTurn) return 'currentTurn';
    return 'idle';
  };

  return (
    <motion.g
      className={className}
      initial="idle"
      animate={getAnimationState()}
      style={{
        zIndex: isCurrentTurn ? 10 : 5,
      }}
      layout
      layoutId={`pawn-${team}`}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 1,
      }}
    >
      {/* Pawn Shadow */}
      <motion.ellipse
        cx={x}
        cy={y + 25}
        rx="15"
        ry="5"
        fill="rgba(0, 0, 0, 0.2)"
        className="pointer-events-none"
        animate={{
          opacity: isMoving ? 0.1 : 0.3,
        }}
      />

      {/* Pawn Body */}
      <motion.circle
        cx={x}
        cy={y}
        r="20"
        fill={config.color}
        stroke="#FFFFFF"
        strokeWidth="3"
        variants={pawnVariants}
        className="cursor-pointer"
        style={{
          filter: isCurrentTurn 
            ? `drop-shadow(0 0 15px ${config.color})` 
            : 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
        }}
      />

      {/* Team Emoji */}
      <text
        x={x}
        y={y + 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-lg pointer-events-none select-none"
        style={{ fontSize: '16px' }}
      >
        {config.emoji}
      </text>

      {/* Current Turn Indicator */}
      {isCurrentTurn && (
        <motion.circle
          cx={x}
          cy={y}
          r="28"
          fill="none"
          stroke={config.color}
          strokeWidth="2"
          strokeDasharray="8,4"
          className="pointer-events-none"
          animate={{
            strokeDashoffset: [0, -12],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Position Indicator */}
      <motion.text
        x={x}
        y={y - 35}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs font-bold pointer-events-none"
        fill={config.color}
        initial={{ opacity: 0, y: y - 30 }}
        animate={{ 
          opacity: isCurrentTurn ? 1 : 0,
          y: isCurrentTurn ? y - 35 : y - 30,
        }}
        transition={{ duration: 0.3 }}
      >
        {position}
      </motion.text>

      {/* Movement Trail Effect */}
      {isMoving && (
        <motion.circle
          cx={x}
          cy={y}
          r="20"
          fill={config.color}
          opacity="0.3"
          className="pointer-events-none"
          animate={{
            scale: [1, 2, 3],
            opacity: [0.3, 0.1, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}

      {/* Accessibility */}
      <title>
        {config.name} team pawn at position {position}
        {isCurrentTurn && ' (current turn)'}
      </title>
    </motion.g>
  );
};

export default React.memo(Pawn);
