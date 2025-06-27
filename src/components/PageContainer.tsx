import React, { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
  fluid?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({
  title,
  description,
  children,
  className = '',
  actions,
  fluid = true
}) => {
  return (
    <div className={`flex-1 w-full ${className}`}>
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className={`${fluid ? 'w-full' : 'max-w-7xl mx-auto'} px-6 lg:px-8`}>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              {description && (
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              )}
            </div>
            {actions && (
              <div className="mt-4 sm:mt-0 sm:ml-4">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className={`${fluid ? 'w-full px-6 lg:px-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'} py-6`}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageContainer;
