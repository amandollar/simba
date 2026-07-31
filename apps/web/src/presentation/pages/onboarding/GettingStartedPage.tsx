import { useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useLatestAudit,
  useMerchant,
  useProducts,
  useAuditScanFlow,
} from "@/application/hooks";
import { AuditScanExperience } from "@/presentation/components/simba/AuditScanExperience";
import { Button } from "@/presentation/components/ui/Button";
import { Card, CardBody } from "@/presentation/components/ui/Card";
import { Check, Icon, Package, Sparkles, Store } from "@/presentation/components/ui/Icon";
import { SimbaLogo } from "@/presentation/components/ui/SimbaLogo";
import { Banner } from "@/presentation/components/ui/States";
import { CardGridSkeleton } from "@/presentation/components/ui/PageSkeletons";

export function GettingStartedPage() {
  const navigate = useNavigate();
  const { data: merchant } = useMerchant();
  const { data: audit, loading: auditLoading, reload } = useLatestAudit();
  const { data: products, loading: productsLoading } = useProducts();

  const handleScanComplete = useCallback(async () => {
    await reload();
    navigate("/simba", { replace: true });
  }, [reload, navigate]);

  const {
    startScan,
    isActive: scanning,
    stepIndex,
    progress,
    isFinishing,
    isCompleting,
    isBackgrounded,
    error: scanError,
  } = useAuditScanFlow({ onComplete: handleScanComplete });

  const productCount = products?.length ?? 0;
  const hasProduct = productCount > 0;
  const hasScan = Boolean(audit);
  const allDone = hasProduct && hasScan;

  useEffect(() => {
    if (!auditLoading && hasScan) {
      navigate("/simba", { replace: true });
    }
  }, [auditLoading, hasScan, navigate]);

  async function handleRunScan() {
    await startScan(audit?.id ?? null);
  }

  if (auditLoading || productsLoading) {
    return <CardGridSkeleton count={3} />;
  }

  if (hasScan) {
    return <CardGridSkeleton count={1} />;
  }

  const steps = [
    {
      id: "store",
      label: "Create your store",
      hint: "You're all set here.",
      done: true,
      icon: Store,
    },
    {
      id: "product",
      label: "Add your first product",
      hint: hasProduct
        ? `${productCount} product${productCount === 1 ? "" : "s"} in your catalog`
        : "Simba needs something in your catalog to scan.",
      done: hasProduct,
      icon: Package,
      action: !hasProduct ? (
        <Link to="/products/new?onboarding=1">
          <Button variant="primary">Add product</Button>
        </Link>
      ) : (
        <Link to="/products/new?onboarding=1">
          <Button variant="secondary">Add another</Button>
        </Link>
      ),
    },
    {
      id: "scan",
      label: "Run your first Simba scan",
      hint: hasProduct
        ? "Get your health score and a prioritized fix list."
        : "Add a product first, then scan.",
      done: hasScan,
      icon: Sparkles,
      action: (
        <Button
          variant="simba"
          onClick={handleRunScan}
          disabled={!hasProduct || scanning}
        >
          {scanning ? "Scanning…" : "Run scan"}
        </Button>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-6 py-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)] border border-border bg-surface-overlay">
          <SimbaLogo size={28} className="rounded-sm" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Get started</h1>
        <p className="mt-2 text-sm text-muted">
          Three quick steps — then Simba tells you what to fix first.
        </p>
      </div>

      {scanError && <Banner variant="error">{scanError}</Banner>}

      {scanning ? (
        <AuditScanExperience
          stepIndex={stepIndex}
          progress={progress}
          isFinishing={isFinishing}
          isCompleting={isCompleting}
          isBackgrounded={isBackgrounded}
          storeName={merchant?.name}
          productCount={productCount}
        />
      ) : null}

      <Card>
        <CardBody className="space-y-1 p-0">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex gap-4 px-5 py-4 ${
                index < steps.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  step.done
                    ? "bg-success/15 text-success"
                    : "bg-surface-overlay text-muted"
                }`}
              >
                {step.done ? (
                  <Icon icon={Check} size={16} />
                ) : (
                  <Icon icon={step.icon} size={16} />
                )}
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      step.done && step.id !== "scan" ? "text-muted" : ""
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">{step.hint}</p>
                </div>
                {!step.done && step.action}
                {step.id === "product" && step.done && step.action}
                {step.id === "scan" && !step.done && hasProduct && step.action}
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-xs text-muted">
          {allDone
            ? "Finishing up…"
            : `${steps.filter((s) => s.done).length} of ${steps.length} complete`}
        </p>
        <Link to="/store" className="text-sm text-muted hover:text-foreground">
          Skip for now — go to dashboard
        </Link>
      </div>
    </div>
  );
}
