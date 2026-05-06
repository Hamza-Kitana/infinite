import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePublicUser } from "@/contexts/PublicUserContext";
import { useApplicationsContent } from "@/contexts/ApplicationsContentContext";
import { JOB_ROLE_LAWS, type JobRoleKey } from "@/data/jobRoleLaws";
import { toast } from "sonner";

const JobsApplicationFormPage = () => {
  const { role = "" } = useParams();
  const navigate = useNavigate();
  const { user } = usePublicUser();
  const { submitApplication } = useApplicationsContent();
  const [discord, setDiscord] = useState("");
  const [experience, setExperience] = useState("");
  const [openLaws, setOpenLaws] = useState(false);
  const [acceptedLaws, setAcceptedLaws] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const roleKey = (role in JOB_ROLE_LAWS ? role : "") as JobRoleKey | "";
  const lawSet = roleKey ? JOB_ROLE_LAWS[roleKey] : null;

  if (!user) return <Navigate to="/" replace />;
  if (!lawSet) return <Navigate to="/jobs" replace />;

  const submit = () => {
    if (!discord.trim()) {
      toast.error("أدخل حساب الديسكورد");
      return;
    }
    if (!experience.trim() || experience.trim().length < 20) {
      toast.error("اكتب نبذة أوضح عن خبرتك (20 حرف على الأقل)");
      return;
    }
    if (!acceptedLaws) {
      toast.error("يجب قراءة قوانين الجهة والإقرار بها");
      return;
    }
    setSubmitting(true);
    const result = submitApplication({
      roleKey,
      targetTitle: lawSet.title.replace("قوانين ", "").replace("قانون ", ""),
      applicantUserId: user.id,
      applicantUsername: user.username,
      applicantDisplayName: user.displayName,
      snapshot: {
        firstName: user.displayName,
        lastName: "",
        gender: "male",
        birthSummaryLine: "—",
        ageSummaryLine: "—",
        countryCode: "JO",
        discord: discord.trim(),
        previousCities: "—",
        experience: experience.trim(),
        lawsAccepted: true,
      },
    });
    setSubmitting(false);
    if (result !== "ok") {
      toast.error("تعذر إرسال الطلب حالياً");
      return;
    }
    toast.success("تم إرسال طلب التوظيف");
    navigate("/jobs");
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-[#f6f0fb] via-[#f8f4fc] to-[#fbf9fe] text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-6 px-4 pb-16 pt-24 md:px-8">
        <section className="rounded-2xl border border-violet-200 bg-white p-5 text-right shadow-[0_12px_32px_-24px_rgba(54,22,79,0.35)]">
          <h1 className="font-display text-2xl font-bold text-slate-900">نموذج توظيف — {lawSet.title.replace("قوانين ", "")}</h1>
          <p className="mt-1 text-sm text-slate-600">{lawSet.subtitle}</p>
        </section>

        <section className="space-y-4 rounded-2xl border border-violet-200 bg-white p-4 shadow-[0_12px_32px_-24px_rgba(54,22,79,0.35)]">
          <div className="space-y-2">
            <Label>حساب الديسكورد</Label>
            <Input value={discord} onChange={(e) => setDiscord(e.target.value)} className="border-violet-200 bg-white text-slate-900" />
          </div>
          <div className="space-y-2">
            <Label>خبرتك ولماذا تريد الانضمام</Label>
            <Textarea value={experience} onChange={(e) => setExperience(e.target.value)} className="min-h-[130px] border-violet-200 bg-white text-slate-900" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-violet-200 bg-violet-50/30 p-3">
            <p className="text-sm text-slate-700">
              {acceptedLaws ? "تمت قراءة القوانين الخاصة بهذه الجهة" : "اقرأ قوانين الجهة قبل الإرسال"}
            </p>
            <Button type="button" variant="outline" className="border-violet-200 bg-white text-violet-700 hover:bg-white" onClick={() => setOpenLaws(true)}>
              عرض قوانين الجهة
            </Button>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="border-violet-200 bg-white text-violet-700 hover:bg-violet-50" onClick={() => navigate("/jobs")}>
              رجوع
            </Button>
            <Button type="button" className="bg-violet-600 text-white hover:bg-violet-700" onClick={submit} disabled={submitting}>
              {submitting ? "جاري الإرسال..." : "إرسال طلب التوظيف"}
            </Button>
          </div>
        </section>
      </main>

      <Dialog open={openLaws} onOpenChange={setOpenLaws}>
        <DialogContent dir="rtl" className="max-w-2xl border-violet-300 bg-[#f7f1fc] text-slate-900">
          <DialogHeader className="text-right">
            <DialogTitle>{lawSet.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-right">
            {lawSet.rules.map((rule, idx) => (
              <div key={idx} className="rounded-lg border border-violet-200 bg-white p-3 text-sm text-slate-700">
                {idx + 1}. {rule}
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              className="bg-violet-600 text-white hover:bg-violet-700"
              onClick={() => {
                setAcceptedLaws(true);
                setOpenLaws(false);
              }}
            >
              أقر بالاطلاع على القوانين
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Footer forceLight />
    </div>
  );
};

export default JobsApplicationFormPage;
