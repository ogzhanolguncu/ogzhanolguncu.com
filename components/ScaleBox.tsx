import { motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

type Props = {
  children: React.ReactNode;
  delayOrder?: number;
  duration?: number;
  easing?: number[];
  [x: string]: any;
};

export const ScaleBox = (props: Props) => {
  const { children, delayOrder = 1, duration, easing = [0.42, 0, 0.58, 1] } = props;
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  const transition = useMemo(
    () => ({
      duration,
      delay: delayOrder / 5,
      ease: easing,
    }),
    [duration, delayOrder, easing],
  );

  const variants = {
    hidden: {
      scale: 0,
      opacity: 0,
      transition,
    },
    show: {
      scale: 1,
      opacity: 1,
      transition: transition,
    },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? 'show' : 'hidden'}
      exit="hidden"
      variants={variants}
      {...props}
    >
      {children}
    </motion.div>
  );
};
