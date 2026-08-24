import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileX2, ArrowLeft, LayoutDashboard } from 'lucide-react';

const PageNotFound: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Page not found';
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-6">
      {/* Faint brand wash, kept quiet so the trail stays the focal point */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-[0.04]"
      />

      <div className="relative flex w-full max-w-lg flex-col items-center text-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
        {/* Workflow trail — mirrors the app's own step indicator, broken at the end */}
        <div
          className="mb-10 flex items-center gap-2"
          role="img"
          aria-label="Workflow: submitted, reviewed, not found"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
          <span className="h-px w-8 bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="h-px w-8 border-t-2 border-dashed border-border" />
          <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-red-500">
            <span className="h-2 w-2 rotate-45 bg-red-500" />
          </span>
        </div>
        <div className="mb-6 flex gap-6 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          <span>Submitted</span>
          <span>Reviewed</span>
          <span className="text-red-500">Not found</span>
        </div>

        {/* Stamp-style numeral, the one bold move on an otherwise quiet page */}
        <h1
          className="-rotate-2 select-none font-heading text-8xl font-extrabold leading-none tracking-tight text-brand-700 sm:text-9xl"
          aria-hidden="true"
        >
          404
        </h1>

        <h2 className="mt-6 font-heading text-2xl font-semibold text-foreground">
          This record doesn&rsquo;t exist
        </h2>
        <p className="mt-3 max-w-sm font-body text-sm text-muted-foreground">
          The page you&rsquo;re looking for has been moved, closed, or was never filed. Check the
          link, or head back to a page that&rsquo;s still open.
        </p>

        <div className="mt-4 rounded-md border border-border bg-muted/50 px-3 py-1.5 font-body text-xs text-muted-foreground">
          Attempted path: <span className="font-medium text-foreground">{location.pathname}</span>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button className="min-w-[160px]" onClick={() => navigate('/')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Return to dashboard
          </Button>
          <Button variant="outline" className="min-w-[160px]" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </div>

        <FileX2 className="mt-10 h-5 w-5 text-muted-foreground/50" aria-hidden="true" />
      </div>
    </div>
  );
};

export default PageNotFound;
