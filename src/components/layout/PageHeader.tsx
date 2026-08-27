import React from 'react';
import Link from 'next/link';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumbs, action }) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-1.5 font-medium">
            <Link href="/dashboard" className="hover:text-slate-600 transition-colors">
              Home
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span>/</span>
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-slate-600 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-600 font-semibold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
};
