import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { calculateSpiralPositions } from '../../utils/spiralMath';
import BoardSpace from './BoardSpace';
import Pawn from './Pawn';
import SpecialSpace from './SpecialSpace';
import BoardOverlay from './BoardOverlay';
import { useBoardAnimation } from '../../hooks/useBoardAnimation';
import type { TeamColor, Team } from '../../types/game.types';

interface SpiralBoardProps {
  teams: Record<TeamColor, Team>;
  currentPosition?: number;
  currentTeam?: TeamColor;
  onSpaceClick?: (position: number) => void;
  className?: string;
}

const SpiralBoard: React.FC<SpiralBoardProps> = ({
  teams,
  currentPosition,
  currentTeam,
  onSpaceClick,
  className = '',
}) => {
  const [highlightedSpace, setHighlightedSpace] = useState<number | null>(null);
  const { highlightSpace, showSpecialEffect } = useBoardAnimation();

  // Calculate spiral positions
  const boardPositions = useMemo(() => {
    const centerX = 400;
    const centerY = 400;
    const maxRadius = 350;
    return calculateSpiralPositions(50, centerX, centerY, maxRadius);
  }, []);

  // Handle space click
  const handleSpaceClick = (position: number) => {
    setHighlightedSpace(position);
    highlightSpace(position);
    
    if (onSpaceClick) {
      onSpaceClick(position);
    }

    // Show special effect if it's a special space
    const space = boardPositions.find(s => s.position === position);
    if (space && space.type !== 'normal') {
      showSpecialEffect(space.type, position);
    }
  };

  // Board animation variants
  const boardVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        ease: 'easeOut',
        staggerChildren: 0.02,
      },
    },
  };

  const spaceVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      {/* Maintain aspect ratio */}
      <div className="relative w-full" style={{ paddingBottom: '100%' }}>
        <div className="absolute inset-0">
          
          {/* SVG Board */}
          <motion.svg
            viewBox="0 0 800 800"
            className="w-full h-full"
            variants={boardVariants}
            initial="hidden"
            animate="visible"
            style={{
              background: 'radial-gradient(circle at center, #f8fafc 0%, #e2e8f0 100%)',
              borderRadius: '1rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* Background Pattern */}
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  opacity="0.5"
                />
              </pattern>
              
              {/* Gradient for special effects */}
              <radialGradient id="centerGlow" cx="50%" cy="50%" r="30%">
                <stop offset="0%" stopColor="rgba(139, 92, 246, 0.1)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Background grid */}
            <rect width="800" height="800" fill="url(#grid)" />
            
            {/* Center glow */}
            <circle cx="400" cy="400" r="200" fill="url(#centerGlow)" />

            {/* Board Spaces */}
            <motion.g variants={spaceVariants}>
              {boardPositions.map((space) => (
                <BoardSpace
                  key={space.position}
                  space={space}
                  teams={teams}
                  isCurrentPosition={currentPosition === space.position}
                  isHighlighted={highlightedSpace === space.position}
                  onClick={handleSpaceClick}
                />
              ))}
            </motion.g>

            {/* Special Space Effects */}
            <motion.g variants={spaceVariants}>
              {boardPositions
                .filter(space => space.type !== 'normal')
                .map((space) => (
                  <SpecialSpace
                    key={`special-${space.position}`}
                    type={space.type}
                    position={space.position}
                    x={space.x}
                    y={space.y}
                    active={currentPosition === space.position}
                  />
                ))}
            </motion.g>

            {/* Team Pawns */}
            <motion.g variants={spaceVariants}>
              {Object.values(teams).map((team) => (
                <Pawn
                  key={team.color}
                  team={team.color}
                  position={team.position}
                  boardPositions={boardPositions}
                  isCurrentTurn={currentTeam === team.color}
                />
              ))}
            </motion.g>

            {/* Start Position Indicator */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <circle
                cx={boardPositions[0]?.x || 400}
                cy={boardPositions[0]?.y || 400}
                r="30"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                strokeDasharray="10,5"
              />
              <text
                x={boardPositions[0]?.x || 400}
                y={(boardPositions[0]?.y || 400) - 40}
                textAnchor="middle"
                className="text-sm font-bold fill-green-600"
              >
                START
              </text>
            </motion.g>

            {/* Finish Position Indicator */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <circle
                cx={boardPositions[49]?.x || 400}
                cy={boardPositions[49]?.y || 400}
                r="35"
                fill="none"
                stroke="#FFD700"
                strokeWidth="4"
                strokeDasharray="8,4"
              />
              <motion.circle
                cx={boardPositions[49]?.x || 400}
                cy={boardPositions[49]?.y || 400}
                r="35"
                fill="none"
                stroke="#FFD700"
                strokeWidth="2"
                strokeDasharray="8,4"
                animate={{
                  strokeDashoffset: [0, -12],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              <text
                x={boardPositions[49]?.x || 400}
                y={(boardPositions[49]?.y || 400) - 50}
                textAnchor="middle"
                className="text-sm font-bold fill-yellow-600"
              >
                FINISH
              </text>
            </motion.g>

            {/* Spiral Path Indicator */}
            <motion.path
              d={`M ${boardPositions.map(p => `${p.x},${p.y}`).join(' L ')}`}
              fill="none"
              stroke="rgba(139, 92, 246, 0.2)"
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, delay: 0.5 }}
            />
          </motion.svg>

          {/* Board Overlay */}
          <BoardOverlay
            currentTeam={currentTeam}
            currentPosition={currentPosition}
            totalSpaces={50}
          />
        </div>
      </div>

      {/* Board Legend */}
      <motion.div
        className="mt-4 bg-white rounded-lg shadow-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Special Spaces</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
              ⭐
            </div>
            <span className="text-sm text-gray-700">Bonus</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs">
              ⚡
            </div>
            <span className="text-sm text-gray-700">Lightning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs">
              🔄
            </div>
            <span className="text-sm text-gray-700">Switch</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs">
              🎯
            </div>
            <span className="text-sm text-gray-700">Steal</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SpiralBoard;
