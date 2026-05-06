import { Link, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePublicUser } from "@/contexts/PublicUserContext";
import { useApplicationsContent } from "@/contexts/ApplicationsContentContext";
import { useSiteVisibility } from "@/lib/siteVisibility";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const JOBS: { role: string; title: string; subtitle: string; visible: (v: ReturnType<typeof useSiteVisibility>) => boolean }[] = [
  { role: "ems", title: "وزارة الصحة", subtitle: "طاقم طبي وإسعافي", visible: (v) => v.institutions.health },
  { role: "police", title: "الداخلية — الشرطة", subtitle: "LSPD", visible: (v) => v.institutions.interior_police },
  { role: "interior_sheriff", title: "الداخلية — الشيرف", subtitle: "Sheriff", visible: (v) => v.institutions.interior_sheriff },
  { role: "interior_cia", title: "الداخلية — CIA", subtitle: "Intelligence", visible: (v) => v.institutions.interior_cia },
  { role: "interior_marines", title: "الداخلية — المارينز", subtitle: "Marines", visible: (v) => v.institutions.interior_marines },
  { role: "oversight", title: "مؤسسة الرقابة", subtitle: "Oversight", visible: (v) => v.institutions.oversight },
  { role: "lawyer", title: "وزارة العدل — هيئة المحاماة", subtitle: "Justice", visible: (v) => v.institutions.justice_lawyers },
  { role: "developer", title: "مؤسسة المبرمجين", subtitle: "Developer", visible: (v) => v.institutions.developer },
];

function statusLabel(status: "pending" | "approved" | "rejected") {
  if (status === "pending") return "قيد المراجعة";
  if (status === "approved") return "مقبول";
  return "مرفوض";
}

const JobsPage = () => {
  const { user } = usePublicUser();
  const { applications } = useApplicationsContent();
  const visibility = useSiteVisibility();

  if (!user) return <Navigate to="/" replace />;

  const visibleJobs = JOBS.filter((j) => j.visible(visibility));
  const myApps = applications
    .filter((a) => a.applicantUserId === user.id || a.applicantUsername === user.username)
    .sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt));

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-[#f6f0fb] via-[#f8f4fc] to-[#fbf9fe] text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-24 md:px-8">
        <section className="rounded-2xl border border-violet-200 bg-white p-5 text-right shadow-[0_12px_32px_-24px_rgba(54,22,79,0.35)]">
          <h1 className="font-display text-2xl font-bold text-slate-900">التقديم لوظيفة</h1>
          <p className="mt-1 text-sm text-slate-600">اختر الجهة المناسبة وقدّم طلبك. حالة الطلب ستظهر لك هنا مباشرة.</p>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          {visibleJobs.map((job) => (
            <div key={job.role} className="rounded-xl border border-violet-200 bg-white p-4 shadow-[0_12px_28px_-24px_rgba(54,22,79,0.35)]">
              <h2 className="font-display text-base font-semibold text-slate-900">{job.title}</h2>
              <p className="mt-1 text-xs text-slate-600">{job.subtitle}</p>
              <div className="mt-3 flex justify-end">
                <Button asChild className="bg-violet-600 text-white hover:bg-violet-700">
                  <Link to={`/jobs/apply/${job.role}`}>تقديم الآن</Link>
                </Button>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-violet-200 bg-white p-4 shadow-[0_12px_32px_-24px_rgba(54,22,79,0.35)]">
          <h2 className="mb-3 text-right font-display text-base font-semibold text-slate-900">طلباتي</h2>
          {myApps.length === 0 ? (
            <p className="rounded-lg border border-violet-200 bg-violet-50/40 p-3 text-sm text-slate-600">لا توجد طلبات حالياً.</p>
          ) : (
            <div className="space-y-2">
              {myApps.map((app) => (
                <div key={app.id} className="rounded-lg border border-violet-200 bg-violet-50/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[11px]",
                        app.status === "pending"
                          ? "border-amber-300 bg-amber-50 text-amber-700"
                          : app.status === "approved"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : "border-rose-300 bg-rose-50 text-rose-700",
                      )}
                    >
                      {statusLabel(app.status)}
                    </span>
                    <p className="text-xs text-slate-500">{new Date(app.submittedAt).toLocaleString("ar")}</p>
                    <p className="font-display text-sm font-semibold text-slate-900">{app.targetTitle}</p>
                  </div>
                  {app.note ? <p className="mt-2 text-sm text-slate-700">ملاحظة الإدارة: {app.note}</p> : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer forceLight />
    </div>
  );
};

export default JobsPage;
