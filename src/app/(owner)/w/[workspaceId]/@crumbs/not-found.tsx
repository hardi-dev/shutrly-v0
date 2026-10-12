import { PageNotFoundCrumbs } from "@/features/workspace/ui/page-not-found-screen/page-not-found-crumbs";

// F-24 D-6 (case a): a missing record in a breadcrumb slot throws notFound(). This boundary shows the
// workspace and the URL's section only, never the missing record (AC-SFX-014).
export default function CrumbsNotFound() {
  return <PageNotFoundCrumbs />;
}
