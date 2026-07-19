import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02] ${className}`}
    >
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-primary opacity-80" />
      </div>
      <h3 className="text-xl font-heading font-bold text-white mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-8">{description}</p>
      
      {actionLabel && onAction && (
        <Button variant="gradient" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
