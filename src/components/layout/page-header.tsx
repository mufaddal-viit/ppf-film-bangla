import { JsonLd } from '@/components/seo/json-ld';
import { Link } from '@/i18n/navigation';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';

type Breadcrumb = { name: string; href: string; url: string };

/** Page title (the page's only <h1>), intro and breadcrumbs with matching BreadcrumbList JSON-LD. */
export function PageHeader({
  title,
  intro,
  breadcrumbs,
  breadcrumbLabel,
}: {
  title: string;
  intro?: string | undefined;
  breadcrumbs: Breadcrumb[];
  breadcrumbLabel: string;
}) {
  return (
    <header className="c-page-header">
      <div className="c-container">
        <nav aria-label={breadcrumbLabel} className="c-breadcrumbs">
          <ol className="flex flex-wrap gap-2">
            {breadcrumbs.map((crumb, i) => {
              const last = i === breadcrumbs.length - 1;
              return (
                <li key={crumb.href} className="flex gap-2">
                  {last ? (
                    <span aria-current="page">{crumb.name}</span>
                  ) : (
                    <>
                      <Link href={crumb.href}>{crumb.name}</Link>
                      <span aria-hidden="true">/</span>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        <h1 className="c-page-title">{title}</h1>
        {intro && <p className="c-page-intro">{intro}</p>}
      </div>
      <JsonLd data={breadcrumbJsonLd(breadcrumbs.map((b) => ({ name: b.name, url: b.url })))} />
    </header>
  );
}
