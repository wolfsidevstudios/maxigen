
import React from 'react';
import { motion } from 'framer-motion';

export const AudioWave: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-1 h-6 w-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-black rounded-full"
          animate={{
            height: [4, 16, 4],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};
