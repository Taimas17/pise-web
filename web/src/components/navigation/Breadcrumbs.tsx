import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }){
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground animate-fade-in">
      <ol className="flex items-center gap-1 flex-wrap">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1">
            {idx > 0 && <ChevronRight className="h-4 w-4 opacity-60" />}
            {item.href ? (
              <Link to={item.href} className="hover:text-foreground transition-colors">{item.label}</Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
