import { WpRuntime } from "@/components/wp-runtime";
import {
  getFooterHtml,
  getHeaderHtml,
  getPageHtml,
  getPopupEntries,
  getSchemaJson,
  getWpRoute,
  type RouteSlug,
} from "@/lib/wp-content";

type WpPageProps = {
  slug: RouteSlug;
};

export function WpPage({ slug }: WpPageProps) {
  const route = getWpRoute(slug);
  const headerHtml = getHeaderHtml(slug);
  const pageHtml = getPageHtml(slug);
  const footerHtml = getFooterHtml();
  const popups = getPopupEntries();
  const schema = getSchemaJson(slug);

  return (
    <>
      <WpRuntime bodyClass={route.bodyClass} />

      <div id="outer-wrap" className="site clr">
        <a className="skip-link screen-reader-text" href="#main">
          Skip to content
        </a>

        <div id="wrap" className="clr">
          <div dangerouslySetInnerHTML={{ __html: headerHtml }} />

          <main id="main" className="site-main clr" role="main">
            <div id="content-wrap" className="container clr">
              <div id="primary" className="content-area clr">
                <div id="content" className="site-content clr">
                  <article className="single-page-article clr">
                    <div className="entry clr" itemProp="text">
                      <div dangerouslySetInnerHTML={{ __html: pageHtml }} />
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </main>

          <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
        </div>
      </div>

      <a
        aria-label="Scroll to the top of the page"
        className="scroll-top-right"
        href="#"
        id="scroll-top"
      >
        <i aria-hidden="true" className="fa fa-angle-up" role="img" />
      </a>

      {popups.map((popup) => (
        <div
          aria-hidden="true"
          aria-modal="true"
          className="elementor-popup-modal dialog-type-lightbox"
          hidden
          id={`elementor-popup-modal-${popup.id}`}
          key={popup.id}
          role="dialog"
        >
          <div className="dialog-widget-content dialog-lightbox-widget-content">
            <button
              aria-label="Close dialog"
              className="dialog-close-button dialog-lightbox-close-button"
              type="button"
            >
              <i aria-hidden="true" className="eicon-close" />
            </button>
            <div
              className="dialog-message dialog-lightbox-message"
              dangerouslySetInnerHTML={{ __html: popup.html }}
            />
          </div>
        </div>
      ))}

      {schema ? (
        <script
          className="yoast-schema-graph"
          dangerouslySetInnerHTML={{ __html: schema }}
          type="application/ld+json"
        />
      ) : null}
    </>
  );
}
