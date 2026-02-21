import { motion } from 'framer-motion';

export default function Card({ children, className='' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`rounded-xl2 border border-zinc-100 bg-white shadow-soft ${className}`}
    >
      {children}
    </motion.div>
  );
}
