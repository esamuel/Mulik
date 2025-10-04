import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getSpaceIcon, getSpaceColor } from '../../utils/spiralMath';
import type { SpaceConfig } from '../../types/game.types';

interface SpecialSpaceProps {
  type: SpaceConfig['type'];
  position: number;
  x: number;
  y: number;
  active?: boolean;
  className?: string;
}

const SpecialSpace: React.FC<SpecialSpaceProps> = ({
  type,
  position,
  x,
  y,
  active = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);

  if (type === 'normal') {
    return null;
  }

  const icon = getSpaceIcon(type);
  const color = getSpaceColor(type);

  // Get tooltip text based on type
  const getTooltipText = () => {
    switch (type) {
      case 'bonus':
        return t('board.bonusSpace', 'Bonus Space: Extra points or another turn');
      case 'lightning':
        return t('board.lightningSpace', 'Lightning Round: Quick-fire questions');
      case 'switch':
        return t('board.switchSpace', 'Switch Space: Swap positions with another team');
      case 'steal':
        return t('board.stealSpace', 'Steal Space: Take points from another team');
      default:
        return '';
    }
  };

  // Animation variants for different types
  const getAnimationVariants = () => {
    const baseVariants = {
      idle: {
        scale: 1,
        opacity: 0.8,
      },
      active: {
        scale: 1.2,
        opacity: 1,
        boxShadow: `0 0 25px ${color}`,
      },
      hover: {
        scale: 1.1,
        opacity: 1,
      },
    };

    switch (type) {
      case 'lightning':
        return {
          ...baseVariants,
          idle: {
            ...baseVariants.idle,
            rotate: [0, 5, -5, 0],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          },
        };
      case 'switch':
        return {
          ...baseVariants,
          idle: {
            ...baseVariants.idle,
            rotate: [0, 180, 360],
            transition: {
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
            },
          },
        };
      case 'steal':
        return {
          ...baseVariants,
          idle: {
            ...baseVariants.idle,
            scale: [1, 1.05, 1],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          },
        };
      default:
        return baseVariants;
    }
  };

  const variants = getAnimationVariants();

  return (
    <g className={className}>
      {/* Special Effect Background */}
      <motion.circle
        cx={x}
        cy={y}
        r="25"
        fill={color}
        opacity="0.3"
        className="pointer-events-none"
        animate={active ? {
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.1, 0.3],
        } : {}}
        transition={{
          duration: 2,
          repeat: active ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />

      {/* Icon Container */}
      <motion.g
        variants={variants}
        initial="idle"
        animate={active ? 'active' : 'idle'}
        whileHover="hover"
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
        className="cursor-help"
      >
        {/* Icon Background */}
        <circle
          cx={x}
          cy={y}
          r="18"
          fill={color}
          stroke="#FFFFFF"
          strokeWidth="2"
          style={{
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))',
          }}
        />

        {/* Icon */}
        <text
          x={x}
          y={y + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-lg pointer-events-none select-none"
          fill="#FFFFFF"
          style={{ fontSize: '16px' }}
        >
          {icon}
        </text>
      </motion.g>

      {/* Lightning Spark Effect */}
      {type === 'lightning' && active && (
        <motion.g className="pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.line
              key={i}
              x1={x}
              y1={y}
              x2={x + Math.cos(i * Math.PI / 3) * 30}
              y2={y + Math.sin(i * Math.PI / 3) * 30}
              stroke="#FFF700"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{
                opacity: [0, 1, 0],
                pathLength: [0, 1, 0],
              }}
              transition={{
                duration: 0.3,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          ))}
        </motion.g>
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.g
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none"
          >
            {/* Tooltip Background */}
            <rect
              x={x - 80}
              y={y - 60}
              width="160"
              height="30"
              rx="6"
              fill="rgba(0, 0, 0, 0.9)"
              stroke="#FFFFFF"
              strokeWidth="1"
            />
            
            {/* Tooltip Text */}
            <text
              x={x}
              y={y - 42}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs"
              fill="#FFFFFF"
              style={{ fontSize: '11px' }}
            >
              {getTooltipText()}
            </text>
            
            {/* Tooltip Arrow */}
            <polygon
              points={`${x - 5},${y - 30} ${x + 5},${y - 30} ${x},${y - 20}`}
              fill="rgba(0, 0, 0, 0.9)"
            />
          </motion.g>
        )}
      </AnimatePresence>

      {/* Accessibility */}
      <title>
        {getTooltipText()}
      </title>
    </g>
  );
};

export default React.memo(SpecialSpace);
