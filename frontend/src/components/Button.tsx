import { motion } from 'framer-motion';

export default function Button({
  children, onClick, variant='primary', className='', disabled
}:{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary'|'secondary'|'ghost';
  className?: string;
  disabled?: boolean;
}) {
  const base = "w-full rounded-xl2 px-4 py-3 text-sm font-semibold transition active:scale-[0.99]";
  const styles = variant === 'primary'
    ? "bg-zinc-900 text-white hover:bg-zinc-800"
    : variant === 'secondary'
      ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
      : "bg-transparent text-zinc-900 hover:bg-zinc-50";

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${styles} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </motion.button>
  );
}
