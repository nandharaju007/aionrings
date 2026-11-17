import { useEffect, useState } from "react";
import { RotateCcw, Eye, X, History, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

const PAGE_SIZE = 10;
const KIT_API = "https://aionringcloudservice-csbbbub5bxc0c9cw.canadacentral-01.azurewebsites.net/api/sizing-kits";
type KitStatusEntry = { orderId?: string; sizingKitId?: string; status: string; date: string };

const titleCaseName = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");

export function AdminSizingKitRequests() {
  const [rows, setRows] = useState<Tables<"sizing_kit_requests">[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Tables<"sizing_kit_requests"> | null>(null);
  const [viewingLog, setViewingLog] = useState<Tables<"sizing_kit_requests"> | null>(null);
  const [statusLog, setStatusLog] = useState<KitStatusEntry[]>([]);
  const [statusError, setStatusError] = useState("");
  const [openStatusMenu, setOpenStatusMenu] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);
  const loadStatuses = async () => {
    try {
      const response = await fetch(`${KIT_API}/status`);
      if (!response.ok) throw new Error();
      const data: unknown = await response.json();
      if (!Array.isArray(data) || !data.every((entry) =>
        entry && typeof entry.status === "string" && typeof entry.date === "string" &&
        (typeof entry.orderId === "string" || typeof entry.sizingKitId === "string"))) throw new Error();
      setStatusLog(data);
      setStatusError("");
    } catch {
      setStatusError("Sizing kit status history is unavailable from Azure. Status changes cannot be saved yet.");
    }
  };
  const entriesFor = (id: string) => statusLog.filter((entry) => (entry.sizingKitId ?? entry.orderId) === id);
  const currentStatus = (id: string) => {
    const entries = entriesFor(id);
    if (entries.some((entry) => entry.status === "delivered")) return "delivered";
    if (entries.some((entry) => entry.status === "shipped")) return "shipped";
    return "received";
  };
  const updateStatus = async (id: string, status: string) => {
    setOpenStatusMenu(null);
    setSavingStatus(id);
    try {
      const response = await fetch(`${KIT_API}/${encodeURIComponent(id)}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error();
      await loadStatuses();
    } catch {
      setStatusError("Could not save the sizing kit status. Refresh and try again.");
    } finally {
      setSavingStatus(null);
    }
  };
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const load = async () => {
    setBusy(true);
    setError("");
    await loadStatuses();
    try {
      const response = await fetch(
        "https://aionringcloudservice-csbbbub5bxc0c9cw.canadacentral-01.azurewebsites.net/api/sizing-kits",
      );
      if (!response.ok) throw new Error();
      setRows(await response.json());
    } catch {
      setError("Could not load sizing kit requests.");
    }
    setBusy(false);
  };
  useEffect(() => {
    void load();
  }, []);
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="text-[14px] text-ink-muted">
          <span className="text-ink font-medium">{rows.length}</span> sizing kit requests total
        </div>
        <button
          onClick={() => void load()}
          disabled={busy}
          aria-label="Refresh sizing kit requests"
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13px] text-ink-soft hover:bg-canvas transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>
      {statusError && <p role="status" className="mb-4 text-[13px] text-ink-muted">{statusError}</p>}
      {error ? (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      ) : busy ? (
        <p className="text-[13px] text-ink-muted">Loading…</p>
      ) : !rows.length ? (
        <p className="text-[13px] text-ink-muted">No sizing kit requests yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-[13px]">
            <thead className="bg-canvas text-[11px] uppercase tracking-[2px] text-ink-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 text-center font-medium">ID</th>
                <th className="px-4 py-3 text-center font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-center font-medium">Phone</th>
                <th className="px-4 py-3 text-center font-medium">Location</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-center font-medium">Log</th>
                <th className="px-4 py-3 text-center font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={row.id} className="h-14 border-t border-border hover:bg-white">
                  <td className="px-4 py-3 font-mono text-[12px] text-primary text-center whitespace-nowrap">
                    {row.id.slice(-8)}
                  </td>
                  <td className="px-4 py-3 text-ink-soft text-center whitespace-nowrap">
                    {new Date(row.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-left whitespace-nowrap">{titleCaseName(row.name)}</td>
                  <td className="px-4 py-3 text-ink-soft text-left whitespace-nowrap">{row.email}</td>
                  <td className="px-4 py-3 text-ink-soft text-center whitespace-nowrap">{row.phone}</td>
                  <td
                    className="px-4 py-3 text-ink-soft text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]"
                    title={`${row.address}, ${[row.city, row.region, row.postcode].filter(Boolean).join(", ")}, ${row.country}`}
                  >
                    {row.address}, {[row.city, row.region, row.postcode].filter(Boolean).join(", ")}, {row.country}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-2 whitespace-nowrap">
                      <span className={`text-[12px] font-medium ${statusError ? "text-ink-muted" : "text-primary"}`}>
                        {statusError ? "Unavailable" : currentStatus(row.id) === "received" ? "Request Received" : currentStatus(row.id) === "shipped" ? "Shipped" : "Delivered"}
                      </span>
                      <Button variant="outline" size="icon" className="w-6 h-6 rounded-full shrink-0"
                        aria-label={`Change status for ${titleCaseName(row.name)}`}
                        title={statusError || "Change status"}
                        disabled={Boolean(statusError) || savingStatus === row.id || currentStatus(row.id) === "delivered"}
                        onClick={() => setOpenStatusMenu(openStatusMenu === row.id ? null : row.id)}>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </div>
                    {openStatusMenu === row.id && (
                      <div className="mt-1 rounded-xl border border-border bg-background p-1">
                        <Button variant="ghost" className="w-full text-[12px]" onClick={() => void updateStatus(row.id, currentStatus(row.id) === "shipped" ? "delivered" : "shipped")}>
                          {currentStatus(row.id) === "shipped" ? "Delivered" : "Shipped"}
                        </Button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="outline" size="icon" className="rounded-full w-8 h-8"
                      aria-label={`View status log for ${titleCaseName(row.name)}`} title="View status log"
                      onClick={() => setViewingLog(row)}>
                      <History className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setExpanded(row)}
                      aria-label="View request details"
                      className="inline-flex items-center justify-center rounded-full border border-border w-8 h-8 hover:border-border"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!error && !busy && rows.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-[13px] text-ink-muted">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-full border border-border px-4 py-2 text-[13px] hover:border-border disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-full border border-border px-4 py-2 text-[13px] hover:border-border disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
      {expanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setExpanded(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[12px] uppercase tracking-[3px] text-primary">Sizing Kit Request</div>
              <button
                onClick={() => setExpanded(null)}
                aria-label="Close details"
                className="text-ink-muted hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-[14px]">
              <div>
                <div className="font-medium text-ink">{titleCaseName(expanded.name)}</div>
                <div className="text-ink-soft">
                  {expanded.email} · {expanded.phone}
                </div>
              </div>
              <div className="text-ink-soft">
                {expanded.address}
                <br />
                {[expanded.city, expanded.region, expanded.postcode].filter(Boolean).join(", ")}
                <br />
                {expanded.country}
              </div>
              <div className="text-[13px] text-ink-muted">
                Received {new Date(expanded.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
      {viewingLog && (
        <div className="fixed inset-0 z-50 bg-ink/35 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setViewingLog(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="kit-tracking-title" className="bg-background border border-border rounded-2xl p-6 max-w-md w-full" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div id="kit-tracking-title" className="text-[12px] uppercase tracking-[3px] text-primary">Sizing Kit Tracking</div>
              <Button variant="ghost" size="icon" aria-label="Close status log" className="w-8 h-8 text-ink-muted" onClick={() => setViewingLog(null)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="text-[13px] text-ink-muted mb-4">{titleCaseName(viewingLog.name)}</div>
            {statusError && <p className="text-[13px] text-ink-muted mb-4">{statusError}</p>}
            <ol>
              {[{ value: "received", label: "Request Received" }, { value: "shipped", label: "Shipped" }, { value: "delivered", label: "Delivered" }].map((step, index) => {
                const entry = entriesFor(viewingLog.id).find((item) => item.status === step.value);
                const date = step.value === "received" ? viewingLog.created_at : entry?.date;
                return <li key={step.value} className="flex gap-3 text-[13px]">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${date ? "bg-primary" : "bg-background border border-border"}`} />
                    {index < 2 && <div className="w-0.5 flex-1 min-h-[24px] bg-border" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className={date ? "text-ink font-medium" : "text-ink-muted"}>{step.label}</div>
                    <div className="text-[11px] text-ink-muted">{date ? new Date(date).toLocaleString() : statusError ? "History unavailable" : "Awaiting confirmation"}</div>
                  </div>
                </li>;
              })}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}
