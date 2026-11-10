import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowUp, Check, Lock } from "lucide-react";
import { useState } from "react";
import { AgentMark } from "@/components/studio/agent-icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { agents } from "@/lib/agents";
import { CURRENT_USER, RESTRICTION_NOTE, type AgentId } from "@/lib/studio-data";
import { canChat, useStudio } from "@/lib/studio-store";

type Agent = (typeof agents)[number];
const ROWS: Agent[][] = [agents.slice(0, 3), agents.slice(3, 6), agents.slice(5).concat(agents.slice(0, 1))];
const IDEAS = ["Win back guests who booked through OTAs", "Plan a Genna weekend staycation", "Which guests should we reach next?"];

function Pill({ agent, onOpen }: { agent: Agent; onOpen: (a: Agent) => void }) {
  const [first, ...rest] = agent.name.split(" ");
  return (
    <button onClick={() => onOpen(agent)} className="group flex shrink-0 items-center gap-3 rounded-[14px] border bg-card/90 py-3 pl-3 pr-6 text-left shadow-card backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <AgentMark id={agent.id} size="lg" />
      <span className="text-[17px] whitespace-nowrap">
        <span className="font-medium text-foreground">{first}</span> <span className="text-muted-foreground">{rest.join(" ")}</span>
        <span className="block text-xs text-muted-foreground">{agent.role}</span>
      </span>
    </button>
  );
}

export function TeamIntroduction({ onContinue }: { onContinue: () => void }) {
  const [selected, setSelected] = useState<Agent | null>(null);
  const [text, setText] = useState("");
  const navigate = useNavigate();
  const perms = useStudio((st) => st.permissions);
  const allowed = selected ? canChat(perms, selected.id as AgentId, CURRENT_USER.role) : false;
  const start = (prompt: string) => navigate({ to: "/ai-studio", search: prompt.trim() ? { prompt: prompt.trim() } : {} });

  return (
    <div className="team-introduction relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="glow-field" aria-hidden><span /><span /><span /></div>

      <header className="relative z-10 flex h-14 items-center justify-between px-6 lg:px-10">
        <span className="text-xs tracking-[0.2em] text-muted-foreground uppercase">The Meridian Hotel · AI Studio</span>
        <Button variant="ghost" size="sm" onClick={onContinue}>Skip to campaigns <ArrowRight /></Button>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-[1120px] px-6 pt-8 lg:px-10 lg:pt-14">
        <h1 className="max-w-[720px] text-[44px] leading-[1.05] font-semibold tracking-tight sm:text-6xl">
          Agents that work <span className="text-muted-foreground">while your hotel sleeps.</span>
        </h1>
        <p className="mt-5 max-w-[520px] text-lg text-foreground/80">Eight AI teammates, one goal: more direct bookings and guests who come back.</p>
      </section>

      <section className="marquee-mask relative z-10 mt-10 space-y-4 lg:mt-14" aria-label="Your AI team">
        {ROWS.map((row, i) => {
          const loop = [...row, ...row, ...row, ...row];
          return (
            <div key={i} className="marquee-row overflow-hidden py-1">
              <div className={i === 1 ? "marquee marquee-reverse" : i === 2 ? "marquee marquee-slow" : "marquee"} style={{ marginLeft: i === 1 ? -120 : 0 }}>
                {loop.map((a, j) => <Pill key={`${a.id}-${j}`} agent={a} onOpen={setSelected} />)}
              </div>
            </div>
          );
        })}
      </section>

      <section className="relative z-10 mx-auto mt-auto w-full max-w-[720px] px-6 pb-10 pt-12">
        <form onSubmit={(e) => { e.preventDefault(); start(text); }} className="rounded-[18px] border bg-card/90 p-2 shadow-lift backdrop-blur">
          <div className="flex items-center gap-3 px-2">
            <span className="hero-orb size-8 shrink-0" aria-hidden />
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Start chatting with your AI team…" aria-label="Ask your AI team" className="h-12 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground" />
            <button type="submit" aria-label="Start" className="grid size-10 place-items-center rounded-[12px] bg-sidebar text-sidebar-accent-foreground transition-transform hover:scale-105"><ArrowUp className="size-4" /></button>
          </div>
        </form>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {IDEAS.map((p) => <button key={p} onClick={() => start(p)} className="rounded-full border bg-card/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur hover:text-foreground">{p}</button>)}
        </div>
      </section>

      <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-[460px] bg-card p-7">
          {selected && (
            <>
              <AgentMark id={selected.id} size="xl" />
              <div><p className="mb-2 text-xs font-medium text-primary">{selected.role}</p><DialogTitle className="text-2xl">{selected.name}</DialogTitle><DialogDescription className="mt-3 leading-relaxed">{selected.description}</DialogDescription></div>
              <div className="border-t pt-4"><h2 className="mb-3 text-xs font-medium text-muted-foreground">WHAT I BRING TO YOUR TEAM</h2><ul className="space-y-3">{selected.tasks.map((task) => <li key={task} className="flex items-center gap-3 text-sm"><Check className="size-4 text-primary" />{task}</li>)}</ul></div>
              {allowed
                ? <Button asChild className="mt-2"><Link to="/ai-studio" search={{ agent: selected.id as AgentId }} onClick={() => setSelected(null)}>Ask {selected.name} <ArrowRight /></Link></Button>
                : <p className="mt-2 flex gap-2 border bg-muted px-3 py-2 text-sm text-muted-foreground"><Lock className="mt-0.5 size-3.5 shrink-0" />{RESTRICTION_NOTE}. Your Marketing Manager can still involve this specialist.</p>}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
