import React from 'react';
import { cn } from '@/lib/utils';
interface CorporateLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'neutral';
}
export const CorporateLayout = ({
  children,
  className,
  variant = 'primary'
}: CorporateLayoutProps) => {
  const variants = {
    primary: 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100',
    secondary: 'bg-gradient-to-br from-gray-50 to-gray-100',
    neutral: 'bg-white'
  };
  return <div className={cn('min-h-screen', variants[variant], className)}>
      {children}
    </div>;
};
interface CorporateCardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}
export const CorporateCard = ({
  children,
  className,
  elevated = false
}: CorporateCardProps) => {
  return <div className={cn('bg-white rounded-xl border border-gray-200/60 backdrop-blur-sm', elevated ? 'shadow-lg shadow-gray-900/5' : 'shadow-sm', 'transition-all duration-200 hover:shadow-md hover:shadow-gray-900/10', className)}>
      {children}
    </div>;
};
interface CorporateHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}
export const CorporateHeader = ({
  title,
  subtitle,
  icon,
  actions,
  className
}: CorporateHeaderProps) => {
  return <div className={cn('flex items-center justify-between mb-6', className)}>
      <div className="flex items-center space-x-4">
        {icon}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-slate-600 mt-1 max-w-2xl">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center space-x-3">
          {actions}
        </div>}
    </div>;
};
interface CorporateSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}
export const CorporateSection = ({
  title,
  children,
  className,
  contentClassName
}: CorporateSectionProps) => {
  return <div className={cn('space-y-4', className)}>
      {title && <h2 className="text-lg font-semibold text-slate-900 border-b border-gray-200 pb-2">
          {title}
        </h2>}
      <div className={cn('space-y-4', contentClassName)}>
        {children}
      </div>
    </div>;
};
interface CorporateStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
  }>;
  className?: string;
}
export const CorporateStats = ({
  stats,
  className
}: CorporateStatsProps) => {
  return <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {stats.map((stat, index) => <CorporateCard key={index} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              {stat.trendValue && <div className={cn('flex items-center mt-2 text-sm', stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600')}>
                  <span>{stat.trendValue}</span>
                </div>}
            </div>
            {stat.icon && <div className="p-2 bg-blue-50 rounded-lg">
                <div className="text-blue-600">
                  {stat.icon}
                </div>
              </div>}
          </div>
        </CorporateCard>)}
    </div>;
};