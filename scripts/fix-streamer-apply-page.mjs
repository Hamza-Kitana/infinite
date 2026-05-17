import fs from "fs";

const path = "src/pages/StreamerApplyPage.tsx";
let s = fs.readFileSync(path, "utf8");

// Fix mismatched closing tags (motion.div used where div was opened)
s = s.replace(/<\/motion\.motion\.motion\.motion\.div>/g, "</div>");
s = s.replace(/<\/motion\.div>/g, "</div>");

// Static wrappers should be div, not motion.div
s = s.replace(/<motion\.div className="light/g, '<motion.div className="light'.replace("motion.", ""));
s = s.replace('<motion.div className="light', '<motion.div className="light');
// fix the botched replace above
s = s.replace('<motion.div className="light', '<motion.div className="light');
s = s.replace('<motion.div className="light', '<motion.div className="light');

// Actually do properly:
s = fs.readFileSync(path, "utf8");
s = s.replace(/<\/motion\.div>/g, "</motion.div>");
s = s.replace(/<motion\.div className="light/g, '<motion.div className="light');
s = s.replace(/<motion\.motion\.motion\.motion\.div className="pointer-events-none absolute -right/g, '<motion.div className="pointer-events-none absolute -right');
s = s.replace(/<motion\.div className="pointer-events-none absolute -right/g, '<motion.div className="pointer-events-none absolute -right');

s = s.replace(
  /              <\/motion\.div>\n            <\/motion\.div>\n            <p className="font-display text-\[11px\]/,
  "              </motion.div>\n            </motion.div>\n            <p className=\"font-display text-[11px]",
);
s = s.replace(
  /          <\/motion\.div>\n        <\/motion\.div>\n\n        <main/,
  "          </motion.div>\n        </motion.div>\n\n        <main",
);
s = s.replace(
  /                  <\/motion\.div>\n                <\/motion\.div>\n                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber/,
  "                  </motion.div>\n                </motion.div>\n                <span className=\"flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber",
);
s = s.replace(
  /              <\/motion\.div>\n            <\/motion\.div>\n          \) : applyApproved/,
  "              </motion.div>\n            </motion.div>\n          ) : applyApproved",
);
s = s.replace(
  /                <\/motion\.motion\.motion\.motion\.motion\.motion\.div>\n                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald/,
  "                </motion.div>\n                <span className=\"flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald",
);
s = s.replace(
  /              <\/motion\.div>\n            <\/motion\.div>\n          \) : \(/,
  "              </motion.div>\n            </motion.div>\n          ) : (",
);

// Form section wrong closes
s = s.replace(/                  <\/motion\.div>\n                \) : null\)/g, "                  </motion.div>\n                ) : null)");
s = s.replace(/                <\/motion\.div>\n\n                <div className="space-y-2">/g, "                </motion.div>\n\n                <motion.div className=\"space-y-2\">".replace(/motion\./g, ""));
// simpler batch for form fields
for (const _ of [0, 1, 2, 3, 4]) {
  s = s.replace(/                <\/motion\.div>\n\n                <div className="space-y-2">/, "                </motion.div>\n\n                <motion.div className=\"space-y-2\">");
}
s = s.replace(/                <\/motion\.div>\n\n                <div className="space-y-2">/g, "                </motion.div>\n\n                <motion.div className=\"space-y-2\">");

console.log("Script incomplete - use manual write");
