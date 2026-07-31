import { SignOutButton } from "@clerk/clerk-react";
import { Button } from "@/presentation/components/ui/Button";
import { Icon, LogOut } from "@/presentation/components/ui/Icon";

export function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <SignOutButton redirectUrl="/">
      <Button
        type="button"
        variant="ghost"
        className={`text-muted hover:text-foreground ${className}`}
      >
        <Icon icon={LogOut} size={16} />
        Log out
      </Button>
    </SignOutButton>
  );
}
