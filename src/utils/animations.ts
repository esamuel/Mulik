/**
 * Reusable Framer Motion animation variants for consistent animations across the app
 */
export const animations = {
  /**
   * Fade in animation - opacity from 0 to 1
   */
  fadeIn: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  },

  /**
   * Slide up animation - moves element from bottom
   */
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },

  /**
   * Slide down animation - moves element from top
   */
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },

  /**
   * Scale in animation - grows from smaller size
   */
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  /**
   * Bounce animation - playful entrance with bounce effect
   */
  bounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
        duration: 0.6
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.3,
      transition: { duration: 0.2 }
    }
  },

  /**
   * Shake animation - for error states and attention-grabbing
   */
  shake: {
    initial: { x: 0 },
    animate: {
      x: [-10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        ease: 'easeInOut'
      }
    }
  },

  /**
   * Slide in from left
   */
  slideInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },

  /**
   * Slide in from right
   */
  slideInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },

  /**
   * Stagger children animation - for lists and grids
   */
  staggerContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  },

  /**
   * Stagger child item animation
   */
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },

  /**
   * Pulse animation - for loading states
   */
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },

  /**
   * Rotate animation - for loading spinners
   */
  rotate: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  }
};

/**
 * Common transition configurations
 */
export const transitions = {
  fast: { duration: 0.2, ease: 'easeOut' },
  normal: { duration: 0.3, ease: 'easeOut' },
  slow: { duration: 0.5, ease: 'easeOut' },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  bouncy: { type: 'spring', stiffness: 400, damping: 10 }
};

/**
 * Hover and tap animations for interactive elements
 */
export const interactions = {
  hover: { scale: 1.05, transition: transitions.fast },
  tap: { scale: 0.95, transition: transitions.fast },
  focus: { 
    scale: 1.02, 
    boxShadow: '0 0 0 3px rgba(217, 70, 239, 0.3)',
    transition: transitions.fast 
  }
};
