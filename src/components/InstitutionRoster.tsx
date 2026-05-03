import ChromaGrid, { type ChromaGridItem } from "@/components/ChromaGrid";
import { cn } from "@/lib/utils";

export type RosterPerson = {
  name: string;
  title: string;
  image: string;
  bio: string;
  /** سطر توضيحي تحت المنصب */
  tagline?: string;
  /** نقاط مسؤوليات أو مجالات عمل */
  highlights?: string[];
};

type InstitutionRosterProps = {
  leader: RosterPerson;
  deputy: RosterPerson;
  members: ChromaGridItem[];
  /** نص الشارة على صورة القائد (افتراضي: رئيس المؤسسة) */
  leaderBadge?: string;
  /** نص الشارة على صورة النائب (افتراضي: نائب الرئيس) */
  deputyBadge?: string;
  /** فقرة تحت عنوان «الهيكل القيادي» */
  leadershipIntro?: string;
  membersTitle?: string;
  membersSubtitle?: string;
  chromaColumns?: number;
  chromaRadius?: number;
  className?: string;
};

function LeadershipCard({
  person,
  roleLabel,
  accentBarClass,
}: {
  person: RosterPerson;
  roleLabel: string;
  accentBarClass: string;
}) {
  const highlights = person.highlights?.filter(Boolean) ?? [];

  return (
    <article
      className={cn(
        "group relative flex min-h-0 flex-col overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card/95 via-card/[0.85] to-background/95 shadow-[0_12px_48px_-28px_hsl(var(--primary)/0.22)] transition-all duration-500",
        "hover:border-primary/35 hover:shadow-[0_24px_64px_-28px_hsl(var(--primary)/0.28)] md:flex-row md:items-stretch",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-l opacity-95",
          accentBarClass,
        )}
      />

      <div className="relative aspect-[16/11] w-full shrink-0 overflow-hidden md:aspect-auto md:w-[min(42%,340px)] md:max-w-[380px] md:min-h-[300px] lg:min-h-[340px]">
        <img
          src={person.image}
          alt={person.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent md:bg-gradient-to-l md:from-transparent md:via-background/40 md:to-background/[0.97]" />
        <span className="absolute left-4 right-4 top-4 z-10 mx-auto max-w-[calc(100%-2rem)] rounded-xl border border-white/15 bg-background/90 px-3 py-2 text-center font-display text-[10px] leading-snug tracking-wide text-primary shadow-lg backdrop-blur-md md:left-auto md:right-5 md:top-5 md:max-w-[13.5rem] md:text-[11px] md:tracking-[0.12em]">
          {roleLabel}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 p-6 md:p-8 lg:p-10 lg:pl-12">
        <header className="space-y-1.5 text-center md:text-right">
          <h3 className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl lg:text-[1.65rem]">
            {person.name}
          </h3>
          <p className="font-display text-sm font-medium text-primary md:text-base">{person.title}</p>
          {person.tagline ? (
            <p className="text-xs leading-relaxed text-muted-foreground/95 md:text-sm">{person.tagline}</p>
          ) : null}
        </header>

        <p className="text-sm leading-relaxed text-muted-foreground md:text-[15px] md:leading-[1.75]">{person.bio}</p>

        {highlights.length > 0 ? (
          <div className="border-t border-primary/15 pt-5">
            <p className="mb-3 font-display text-xs tracking-wide text-primary">مجالات العمل</p>
            <ul className="space-y-2.5">
              {highlights.map((line) => (
                <li key={line} className="flex items-start gap-3 text-right text-sm leading-snug text-foreground/90">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-primary to-secondary shadow-[0_0_10px_hsl(var(--primary)/0.5)]"
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 text-muted-foreground">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function InstitutionRoster({
  leader,
  deputy,
  members,
  leaderBadge = "رئيس المؤسسة",
  deputyBadge = "نائب الرئيس",
  leadershipIntro = "رئيس المؤسسة ونائبه، ثم أعضاء الفريق في الشبكة أدناه.",
  membersTitle = "الأعضاء",
  membersSubtitle,
  chromaColumns,
  chromaRadius = 520,
  className,
}: InstitutionRosterProps) {
  const n = members.length;
  const cols = chromaColumns ?? (n <= 1 ? 1 : n === 2 ? 2 : 3);

  return (
    <section className={cn("w-full", className)}>
      <div className="mb-8 text-center md:text-right">
        <h2 className="font-display text-2xl font-bold md:text-3xl">
          الهيكل <span className="text-gradient-neon">القيادي</span>
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:ms-auto">{leadershipIntro}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-10">
        <LeadershipCard
          person={leader}
          roleLabel={leaderBadge}
          accentBarClass="from-primary via-primary/70 to-secondary/40"
        />
        <LeadershipCard
          person={deputy}
          roleLabel={deputyBadge}
          accentBarClass="from-secondary via-secondary/70 to-primary/40"
        />
      </div>

      <div className="mt-12 md:mt-16">
        <div className="mb-6 text-center md:text-right">
          <h3 className="font-display text-xl font-bold md:text-2xl">{membersTitle}</h3>
          {membersSubtitle ? <p className="mt-2 text-sm text-muted-foreground">{membersSubtitle}</p> : null}
        </div>
        <div className="min-h-[min(70vh,620px)] w-full py-2 md:min-h-[520px]">
          <ChromaGrid
            items={members}
            radius={chromaRadius}
            columns={cols}
            damping={0.55}
            fadeOut={0.75}
            ease="power3.out"
            rtl
          />
        </div>
      </div>
    </section>
  );
}
