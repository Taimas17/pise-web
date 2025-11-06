import { ReactNode } from 'react';

export default function PageHeader({ title, description, breadcrumb, actions }: { title: string; description?: string; breadcrumb?: ReactNode; actions?: ReactNode }){
  return (
    <div className="mb-6 animate-slide-up">
      {breadcrumb && <div className="mb-2 opacity-80">{breadcrumb}</div>}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-1 max-w-2xl">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 ml-auto">{actions}</div>}
      </div>
    </div>
  );
}
