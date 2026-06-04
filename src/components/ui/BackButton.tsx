import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  className?: string;
  fallbackPath?: string;
  label?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function BackButton({
  className,
  fallbackPath,
  label,
  variant = 'ghost',
  size = 'sm'
}: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleBack = () => {
    // If there is history, go back; otherwise go to fallback path
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackPath || (isAdminRoute ? '/admin' : '/'));
    }
  };

  // Determine default label based on route if none provided
  const defaultLabel = label ?? (isAdminRoute ? 'Back' : 'ফিরে যান');

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleBack}
      className={cn(
        "group flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200 pl-2 pr-3 h-9",
        className
      )}
      title="Go Back"
    >
      <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
      {defaultLabel && <span className="text-sm font-semibold">{defaultLabel}</span>}
    </Button>
  );
}
