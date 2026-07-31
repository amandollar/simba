import { Link } from "react-router-dom";
import { Button } from "@/presentation/components/ui/Button";
import { Card, CardBody } from "@/presentation/components/ui/Card";

export function LaunchReminderBanner() {
  return (
    <Card className="border-warning/25 bg-warning/5">
      <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Store not launched yet</p>
          <p className="mt-0.5 text-sm text-muted">
            Finish your catalog, then launch from Store details to start selling.
          </p>
        </div>
        <Link to="/store">
          <Button variant="secondary" className="w-full sm:w-auto">
            Go to store details
          </Button>
        </Link>
      </CardBody>
    </Card>
  );
}
