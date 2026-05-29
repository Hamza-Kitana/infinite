import type { LawRuleItem, LawTabSection } from "@/types/lawsSchema";

export type LawsReaderRuleItem = { id: number; title: string; description: string };

export type LawsReaderSlide =
  | { kind: "rules"; sectionId: string; title: string; items: LawsReaderRuleItem[] }
  | { kind: "safeZones"; sectionId: string; title: string; zones: { icon: string; label: string }[] };

const RULES_PER_SLIDE = 3;

function addRulesSlides(
  slides: LawsReaderSlide[],
  sectionId: string,
  baseTitle: string,
  rules: LawsReaderRuleItem[],
) {
  if (rules.length === 0) return;
  const totalParts = Math.max(1, Math.ceil(rules.length / RULES_PER_SLIDE));
  for (let p = 0; p < totalParts; p += 1) {
    const items = rules.slice(p * RULES_PER_SLIDE, (p + 1) * RULES_PER_SLIDE);
    const title = totalParts > 1 ? `${baseTitle} — الجزء ${p + 1} من ${totalParts}` : baseTitle;
    slides.push({ kind: "rules", sectionId, title, items });
  }
}

function penaltiesToRuleItems(section: Extract<LawTabSection, { kind: "penalties" }>): LawsReaderRuleItem[] {
  const b = section.penalties;
  const out: LawsReaderRuleItem[] = [];
  let seq = 1;

  for (const w of b.warningLevels) {
    out.push({ id: seq++, title: w.title, description: `المدة: ${w.duration}` });
  }
  for (const p of b.specificPenalties) {
    out.push({ id: seq++, title: p.title, description: p.penalty });
  }
  for (const r of b.robberyPeopleRules) {
    out.push({ id: seq++, title: r.label, description: r.value });
  }
  for (const r of b.directPoliceUnitsRules) {
    out.push({ id: seq++, title: r.label, description: r.value });
  }
  return out;
}

function visibleRules(rules: LawRuleItem[]): LawsReaderRuleItem[] {
  return rules
    .filter((r) => !r.hidden)
    .map((r) => ({ id: r.id, title: r.title, description: r.description }));
}

/** يبني شرائح قارئ القوانين من محتوى صفحة /laws (نفس مصدر محرر القوانين) */
export function buildLawsReaderSlides(sections: LawTabSection[]): LawsReaderSlide[] {
  const slides: LawsReaderSlide[] = [];

  for (const section of sections) {
    if (section.hidden) continue;

    if (section.kind === "rules") {
      addRulesSlides(slides, section.id, section.label, visibleRules(section.rules));
      continue;
    }

    addRulesSlides(slides, section.id, section.label, penaltiesToRuleItems(section));
    if (section.penalties.safeZones.length > 0) {
      slides.push({
        kind: "safeZones",
        sectionId: section.id,
        title: `${section.label} — المناطق الآمنة`,
        zones: section.penalties.safeZones,
      });
    }
  }

  return slides;
}

/** يُرجع الشرائح التابعة للأقسام المختارة فقط */
export function filterSlidesBySectionIds(
  slides: LawsReaderSlide[],
  sectionIds: ReadonlySet<string>,
): LawsReaderSlide[] {
  if (sectionIds.size === 0) return [];
  return slides.filter((slide) => sectionIds.has(slide.sectionId));
}
