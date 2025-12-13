import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: 'primary' | 'secondary' | 'accent' | 'destructive';
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'primary'
}: StatsCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
    destructive: 'bg-destructive/10 text-destructive',
  };

  const changeColors = {
    positive: 'text-primary',
    negative: 'text-destructive',
    neutral: 'text-muted-foreground',
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 border-l-4 border-l-primary relative overflow-hidden group">
      {/* Decorative Indian pattern corner */}
      <div className="absolute top-0 right-0 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-primary">
          <circle cx="50" cy="50" r="40" />
          <circle cx="50" cy="50" r="25" fill="currentColor" className="text-secondary" />
          <circle cx="50" cy="50" r="10" fill="currentColor" className="text-accent" />
        </svg>
      </div>
      
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold font-display text-foreground">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[iconColor]} shadow-md`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
