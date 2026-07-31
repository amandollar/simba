import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { merchantApi } from "@/infrastructure/api";
import { slugify, normalizeSlugInput } from "@/domain/slug";
import { Button } from "@/presentation/components/ui/Button";
import { Card, CardBody } from "@/presentation/components/ui/Card";
import { Field, Input, Textarea } from "@/presentation/components/ui/Form";
import { SimbaLogo } from "@/presentation/components/ui/SimbaLogo";
import { LogoutButton } from "@/presentation/components/auth/LogoutButton";

export function OnboardingPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await merchantApi.create({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      });
      navigate("/getting-started");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create store");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center text-center">
          <SimbaLogo size={40} className="mb-4 rounded-[var(--radius-control)]" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Create your store
          </h1>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Set up in under a minute, then Simba scans your shop and tells you
            what to fix.
          </p>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Store name" required>
                <Input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Acme Outdoors"
                />
              </Field>

              <Field label="Store URL" hint="Lowercase letters, numbers, and hyphens">
                <div className="flex items-center rounded-[var(--radius-control)] border border-border bg-surface-raised focus-within:border-foreground/30 focus-within:ring-2 focus-within:ring-foreground/10">
                  <span className="shrink-0 border-r border-border px-3 py-2 text-sm text-muted">
                    /store/
                  </span>
                  <input
                    required
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(normalizeSlugInput(e.target.value));
                    }}
                    placeholder="acme-outdoors"
                    pattern="[a-z0-9-]+"
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                  />
                </div>
              </Field>

              <Field label="Description" hint="Optional — helps shoppers and Simba">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="What do you sell?"
                />
              </Field>

              {error && <p className="text-sm text-danger">{error}</p>}

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Creating…" : "Create store"}
              </Button>
            </form>
          </CardBody>
        </Card>

        <div className="mt-6 flex justify-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
