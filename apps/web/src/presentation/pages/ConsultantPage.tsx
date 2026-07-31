import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  useAnalytics,
  useConsultant,
  useLatestAudit,
  useMerchant,
} from "@/application/hooks";
import { formatMoney } from "@/domain/helpers";
import {
  CONSULTANT_SPECIALIST_LABELS,
  type ConsultantSpecialist,
} from "@/domain/types";
import { LaunchReminderBanner } from "@/presentation/components/dashboard/LaunchReminderBanner";
import { Button } from "@/presentation/components/ui/Button";
import { Card, CardBody } from "@/presentation/components/ui/Card";
import { Icon, IconBox, Send, Sparkles } from "@/presentation/components/ui/Icon";
import { Input } from "@/presentation/components/ui/Form";
import { renderMarkdown } from "@/presentation/components/ui/Markdown";
import { SimbaLogo } from "@/presentation/components/ui/SimbaLogo";
import { ConsultantPageSkeleton } from "@/presentation/components/ui/PageSkeletons";
import { Banner, EmptyState } from "@/presentation/components/ui/States";
import { SimbaSectionHeader } from "@/presentation/components/simba/SimbaSectionHeader";

const suggestions = [
  "What should I fix first?",
  "Am I ready to launch?",
  "Why aren't I getting sales?",
  "Which products need categories?",
  "What's hurting my conversion score?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  specialist?: ConsultantSpecialist;
}

function buildStatusLine(
  audit: { overallScore: number; issues?: { status: string }[] } | null,
  launched: boolean,
  analytics: { orderCount: number; revenue: number } | null
) {
  if (!audit) return "No scan yet — run one from Audit center";

  const open = audit.issues?.filter((i) => i.status === "open").length ?? 0;
  const parts = [`Score ${audit.overallScore}/100`, `${open} to fix`];

  if (launched && analytics) {
    parts.push(
      `${analytics.orderCount} orders`,
      formatMoney(analytics.revenue, { maximumFractionDigits: 0 })
    );
  } else if (!launched) {
    parts.push("Store not launched");
  }

  return parts.join(" · ");
}

export function ConsultantPage() {
  const { data: audit, loading: auditLoading } = useLatestAudit();
  const { data: merchant } = useMerchant();
  const { data: analytics } = useAnalytics();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { mutate: ask, loading, error: askError } = useConsultant();
  const bottomRef = useRef<HTMLDivElement>(null);

  const launched = Boolean(merchant?.launchedAt);
  const statusLine = buildStatusLine(audit, launched, analytics ?? null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading || !audit) return;

    setMessages((m) => [...m, { role: "user", content: text.trim() }]);
    setInput("");

    const reply = await ask(text.trim());
    if (reply) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: reply.reply,
          specialist: reply.specialist,
        },
      ]);
    } else {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't answer that right now. Please try again in a moment.",
        },
      ]);
    }
  }

  if (auditLoading) return <ConsultantPageSkeleton />;

  return (
    <div className="space-y-6">
      {!launched && merchant && <LaunchReminderBanner />}

      <SimbaSectionHeader
        title="Consultant"
        description="Ask about fixes, sales, products, or launch — answers use your latest scan and live store data."
      />

      {askError && <Banner variant="error">{askError}</Banner>}

      <Card className="flex min-h-[min(560px,72vh)] flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <SimbaLogo size={24} className="shrink-0 rounded-sm" />
              <p className="text-sm font-medium">Simba consultant</p>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted" title={statusLine}>
              {statusLine}
            </p>
          </div>
          {audit && (
            <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted">
              Live store data
            </span>
          )}
        </div>

        <CardBody className="flex flex-1 flex-col gap-4 p-0">
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {messages.length === 0 ? (
              !audit ? (
                <EmptyState
                  icon={<IconBox icon={Sparkles} />}
                  title="Run a scan first"
                  message="Simba needs a store scan before it can answer questions about your catalog, scores, and sales."
                  action={
                    <Link to="/simba">
                      <Button variant="simba">Go to audit center</Button>
                    </Link>
                  }
                />
              ) : (
              <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface-overlay">
                  <Icon icon={Sparkles} size={20} className="text-simba" />
                </div>
                <h3 className="mt-4 text-sm font-medium">
                  What do you want to improve?
                </h3>
                <p className="mt-1 max-w-sm text-sm text-muted">
                  Ask about your store, sales, products, or launch — answers use
                  your latest scan and live numbers.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => sendMessage(s)}
                      disabled={!audit || loading}
                      className="rounded-full border border-border bg-surface-raised px-3 py-1.5 text-xs text-muted transition-colors hover:border-border-strong hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              )
            ) : (
              messages.map((msg, i) => (
                <div
                  key={`${msg.role}-${i}`}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <SimbaLogo size={24} className="mt-1 shrink-0 rounded-sm" />
                  )}
                  <div
                    className={`max-w-[85%] space-y-2 rounded-[var(--radius-card)] px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-foreground text-surface-raised"
                        : "border border-border bg-surface-overlay text-foreground"
                    }`}
                  >
                    {msg.role === "assistant" && msg.specialist && (
                      <p className="text-[11px] font-medium text-simba">
                        {CONSULTANT_SPECIALIST_LABELS[msg.specialist]}
                      </p>
                    )}
                    {msg.role === "assistant"
                      ? renderMarkdown(msg.content)
                      : (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      )}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex items-center gap-3">
                <SimbaLogo size={24} className="shrink-0 rounded-sm" />
                <div className="flex items-center gap-2 rounded-[var(--radius-card)] border border-border bg-surface-overlay px-4 py-3 text-sm text-muted">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-foreground" />
                  Looking at your store…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2 border-t border-border p-4"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                audit
                  ? "Ask about fixes, sales, products, or launch…"
                  : "Run a scan first to ask questions…"
              }
              disabled={!audit}
              className="min-w-0 flex-1"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !input.trim() || !audit}
              className="shrink-0 px-3"
            >
              <Icon icon={Send} size={16} />
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
