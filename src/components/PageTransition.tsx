import { motion } from "framer-motion";
import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
}

// Track navigation direction using sessionStorage
const getNavigationDirection = (): 'forward' | 'backward' => {
  const lastPath = sessionStorage.getItem('lastPath');
  const currentPath = window.location.pathname;
  
  // Check if we're going back in history
  const isBackward = lastPath && 
    (window.history.state?.idx !== undefined && 
     parseInt(sessionStorage.getItem('historyIdx') || '0') > window.history.state.idx);
  
  // Update stored values
  sessionStorage.setItem('lastPath', currentPath);
  if (window.history.state?.idx !== undefined) {
    sessionStorage.setItem('historyIdx', String(window.history.state.idx));
  }
  
  return isBackward ? 'backward' : 'forward';
};

const forwardVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
  },
};

const backwardVariants = {
  initial: {
    opacity: 0,
    y: -20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
};

const forwardTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4,
};

const backwardTransition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.25, // Faster for backward navigation
};

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const direction = getNavigationDirection();
  const variants = direction === 'backward' ? backwardVariants : forwardVariants;
  const transition = direction === 'backward' ? backwardTransition : forwardTransition;

  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={transition}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

