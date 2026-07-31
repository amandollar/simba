import { Link } from "react-router-dom";
import type { IssueAction } from "@/domain/issue-actions";
import { Button } from "@/presentation/components/ui/Button";

export function IssueActionButton({ action }: { action: IssueAction }) {
  return (
    <Link to={action.href}>
      <Button variant="secondary" className="h-8 px-3 text-xs">
        {action.label} →
      </Button>
    </Link>
  );
}
