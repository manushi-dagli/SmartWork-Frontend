import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "accent" | "success" | "warning" | "destructive";
}

const variantClasses = {
  default: "bg-card border-border",
  accent: "stat-gradient text-primary-foreground",
  success: "bg-success/10 border-success/20",
  warning: "bg-warning/10 border-warning/20",
  destructive: "bg-destructive/10 border-destructive/20",
};

const iconVariantClasses = {
  default: "bg-secondary text-muted-foreground",
  accent: "bg-primary-foreground/20 text-primary-foreground",
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
  destructive: "bg-destructive/20 text-destructive",
};

export function StatCard({ title, value, subtitle, icon: Icon, variant = "default" }: StatCardProps) {
  return (
    <div className={`rounded-lg border p-5 animate-fade-in ${variantClasses[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${variant === "accent" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
            {title}
          </p>
          <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
          {subtitle && (
            <p className={`text-xs mt-1 ${variant === "accent" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${iconVariantClasses[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
