import type { LaunchReadiness } from "@/domain/launch-readiness";
import { LAUNCH_CHECK_LINKS } from "@/domain/launch-readiness";
import { Link } from "react-router-dom";
import { Button } from "@/presentation/components/ui/Button";
import { Card, CardBody } from "@/presentation/components/ui/Card";
import { Check, Icon, X } from "@/presentation/components/ui/Icon";

export function LaunchChecklist({
  readiness,
  compact = false,
  showLaunchAction = false,
  onLaunch,
  launching = false,
}: {
  readiness: LaunchReadiness;
  compact?: boolean;
  showLaunchAction?: boolean;
  onLaunch?: () => void;
  launching?: boolean;
}) {
  const { ready, passedCount, totalCount, items } = readiness;

  return (
    <Card
      className={
        ready
          ? "border-success/25 bg-success/5"
          : "border-warning/25 bg-warning/5"
      }
    >
      <CardBody className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium">
              {ready ? "Ready to launch" : "Launch checklist"}
            </p>
            <p className="mt-0.5 text-sm text-muted">
              {ready
                ? "Your store meets Simba's launch requirements."
                : `${passedCount} of ${totalCount} complete — finish the rest before going live.`}
            </p>
          </div>
          {showLaunchAction && !compact && (
            <Button
              variant="primary"
              onClick={onLaunch}
              disabled={!ready || launching}
              className="shrink-0"
            >
              {launching ? "Launching…" : "Launch store"}
            </Button>
          )}
        </div>

        <ul className={`space-y-2 ${compact ? "text-sm" : ""}`}>
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-2.5">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  item.passed
                    ? "bg-success/15 text-success"
                    : "bg-danger/10 text-danger"
                }`}
              >
                <Icon icon={item.passed ? Check : X} size={12} />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={
                    item.passed ? "text-muted line-through" : "font-medium"
                  }
                >
                  {item.label}
                </p>
                {!item.passed && item.hint && (
                  <p className="mt-0.5 text-xs text-muted">{item.hint}</p>
                )}
                {!item.passed && LAUNCH_CHECK_LINKS[item.id] && (
                  <Link
                    to={LAUNCH_CHECK_LINKS[item.id]}
                    className="mt-1 inline-block text-xs font-medium text-simba hover:underline"
                  >
                    Fix this →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>

        {compact && !ready && (
          <Link to="/store">
            <Button variant="secondary" className="w-full sm:w-auto">
              Complete checklist
            </Button>
          </Link>
        )}
      </CardBody>
    </Card>
  );
}
