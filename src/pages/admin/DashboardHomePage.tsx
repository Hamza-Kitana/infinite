import { Link } from "react-router-dom";
import { BookOpen, Building2, Car, ClipboardList, Swords, Users, Video } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { adminCard, adminPageWrap, adminStatCard } from "@/lib/adminUi";
import { useApplicationsContent } from "@/contexts/ApplicationsContentContext";
import type { ApplicationRecord } from "@/data/publicApplicationTypes";
import { loadActivityLog } from "@/lib/activityLog";
import { isJobApplicationRoleKey } from "@/data/jobRoleLaws";

const STATUS_LABELS: Record<ApplicationRecord["status"], string> = {
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
};

const ROLE_LABELS: Record<string, string> = {
  citizen: "مواطن",
  police: "الشرطة",
  ems: "الصحة",
  streamers: "صناع المحتوى",
  oversight: "الرقابة",
  justice: "العدل",
  developer: "المبرمجين",
  lawyer: "المحاماة",
  gang: "فتح عصابة",
  vip: "VIP / سيارات",
};

/** نظرة عامة — سوبر أدمِن فقط (المحررون يُوجَّهون إلى تحرير القوانين) */
const DashboardHomePage = () => {
  const { isSuperAdmin } = useAuth();
  const { applications } = useApplicationsContent();

  if (!isSuperAdmin) return null;

  /** دخول السيرفر فقط — بدون طلبات التوظيف (/jobs) */
  const serverApplications = applications.filter((a) => !isJobApplicationRoleKey(a.roleKey));

  const totalApplications = serverApplications.length;
  const pendingCount = serverApplications.filter((a) => a.status === "pending").length;
  const approvedCount = serverApplications.filter((a) => a.status === "approved").length;
  const rejectedCount = serverApplications.filter((a) => a.status === "rejected").length;

  const vipApplications = serverApplications.filter((a) => a.roleKey === "vip");
  const vipPending = vipApplications.filter((a) => a.status === "pending").length;
  const vipApproved = vipApplications.filter((a) => a.status === "approved").length;
  const vipRejected = vipApplications.filter((a) => a.status === "rejected").length;
  const vipDecided = vipApproved + vipRejected;
  const vipApprovalRate = vipDecided > 0 ? Math.round((vipApproved / vipDecided) * 100) : 0;

  const latestApplications = serverApplications.slice(0, 8);
  const latestLogs = loadActivityLog().slice(0, 5);

  const requestsByRole = serverApplications.reduce<Record<string, number>>((acc, item) => {
    acc[item.roleKey] = (acc[item.roleKey] ?? 0) + 1;
    return acc;
  }, {});

  const topRoles = Object.entries(requestsByRole)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  return (
    <div className={cn(adminPageWrap, "max-w-6xl space-y-10")}>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={`${adminStatCard} border-violet-200/90 bg-gradient-to-br from-violet-50 to-white text-right`}>
          <p className="text-xs font-medium text-slate-500">إجمالي الطلبات</p>
          <p className="mt-2 font-display text-3xl font-bold text-violet-700">{totalApplications}</p>
        </div>
        <div className={`${adminStatCard} border-amber-200/80 bg-gradient-to-br from-amber-50 to-white text-right`}>
          <p className="text-xs font-medium text-slate-500">قيد المراجعة</p>
          <p className="mt-2 font-display text-3xl font-bold text-amber-600">{pendingCount}</p>
        </div>
        <div className={`${adminStatCard} border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white text-right`}>
          <p className="text-xs font-medium text-slate-500">الطلبات المقبولة</p>
          <p className="mt-2 font-display text-3xl font-bold text-emerald-600">{approvedCount}</p>
        </div>
        <div className={`${adminStatCard} border-rose-200/80 bg-gradient-to-br from-rose-50 to-white text-right`}>
          <p className="text-xs font-medium text-slate-500">الطلبات المرفوضة</p>
          <p className="mt-2 font-display text-3xl font-bold text-rose-600">{rejectedCount}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className={`${adminCard} p-5 text-right lg:col-span-3`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900">أحدث الطلبات</h2>
            <Link to="/dashboard/applications" className="text-sm font-medium text-violet-600 underline-offset-4 hover:text-violet-800 hover:underline">
              كل الطلبات
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="px-3 py-2 font-medium">النوع</th>
                  <th className="px-3 py-2 font-medium">المتقدم</th>
                  <th className="px-3 py-2 font-medium">الديسكورد</th>
                  <th className="px-3 py-2 font-medium">الحالة</th>
                  <th className="px-3 py-2 font-medium">وقت التقديم</th>
                </tr>
              </thead>
              <tbody>
                {latestApplications.length > 0 ? (
                  latestApplications.map((application) => (
                    <tr key={application.id} className="border-b border-slate-100 text-slate-700 odd:bg-white even:bg-slate-50/60">
                      <td className="px-3 py-2">{ROLE_LABELS[application.roleKey] ?? application.targetTitle}</td>
                      <td className="px-3 py-2">{`${application.snapshot.firstName} ${application.snapshot.lastName}`}</td>
                      <td className="px-3 py-2">{application.snapshot.discord}</td>
                      <td className="px-3 py-2">
                        <span className="rounded-full border border-violet-200/90 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800">
                          {STATUS_LABELS[application.status]}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-500">{new Date(application.submittedAt).toLocaleString("ar-JO")}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                      لا توجد طلبات حتى الآن.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className={`${adminCard} p-5 text-right`}>
            <h3 className="font-display text-base font-bold text-slate-900">تحليل طلبات VIP / السيارات</h3>
            <p className="mt-2 text-sm text-slate-600">ملخص مباشر لأداء طلبات VIP لمساعدتك بقرار أسرع.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-violet-50/90 p-3">
                <p className="text-xs text-slate-500">الإجمالي</p>
                <p className="mt-1 font-display text-xl font-bold text-violet-700">{vipApplications.length}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-violet-50/90 p-3">
                <p className="text-xs text-slate-500">نسبة القبول</p>
                <p className="mt-1 font-display text-xl font-bold text-violet-700">{vipApprovalRate}%</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-amber-50/90 p-3">
                <p className="text-xs text-slate-500">قيد المراجعة</p>
                <p className="mt-1 font-display text-xl font-bold text-amber-600">{vipPending}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-rose-50/90 p-3">
                <p className="text-xs text-slate-500">مرفوض</p>
                <p className="mt-1 font-display text-xl font-bold text-rose-600">{vipRejected}</p>
              </div>
            </div>
          </div>

          <div className={`${adminCard} p-5 text-right`}>
            <h3 className="font-display text-base font-bold text-slate-900">أكثر أنواع الطلبات</h3>
            <div className="mt-4 space-y-2">
              {topRoles.length > 0 ? (
                topRoles.map(([roleKey, count]) => (
                  <div key={roleKey} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/90 px-3 py-2">
                    <span className="text-sm text-slate-700">{ROLE_LABELS[roleKey] ?? roleKey}</span>
                    <span className="rounded-md bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">لا توجد بيانات كافية للتحليل.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={`${adminCard} p-5 text-right`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900">آخر اللوجات</h2>
          <Link to="/dashboard/activity" className="text-sm font-medium text-violet-600 underline-offset-4 hover:text-violet-800 hover:underline">
            عرض السجل الكامل
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="px-3 py-2 font-medium">الوقت</th>
                <th className="px-3 py-2 font-medium">المستخدم</th>
                <th className="px-3 py-2 font-medium">الفعل</th>
                <th className="px-3 py-2 font-medium">التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {latestLogs.length > 0 ? (
                latestLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 text-slate-700 odd:bg-white even:bg-slate-50/60">
                    <td className="px-3 py-2 text-xs text-slate-500">{new Date(log.at).toLocaleString("ar-JO")}</td>
                    <td className="px-3 py-2 font-medium">{log.actor}</td>
                    <td className="px-3 py-2 font-medium text-violet-700">{log.action}</td>
                    <td className="px-3 py-2 text-slate-600">{log.detail ?? "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-slate-500">
                    لا توجد لوجات بعد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-4">
        <Link
          to="/dashboard/users"
          className={`group ${adminCard} p-4 text-right transition-colors hover:border-violet-200 hover:bg-violet-50/50`}
        >
          <Users className="mb-2 h-6 w-6 text-violet-600 transition-transform group-hover:scale-105" />
          <h2 className="font-display text-base font-bold text-slate-900">المستخدمون والأدوار</h2>
          <p className="mt-1 text-xs leading-5 text-slate-600">إنشاء حسابات، كلمة مرور، وتعيين الأدوار.</p>
        </Link>
        <Link
          to="/dashboard/laws"
          className={`group ${adminCard} p-4 text-right transition-colors hover:border-violet-200 hover:bg-violet-50/50`}
        >
          <BookOpen className="mb-2 h-6 w-6 text-violet-600 transition-transform group-hover:scale-105" />
          <h2 className="font-display text-base font-bold text-slate-900">تحرير القوانين</h2>
          <p className="mt-1 text-xs leading-5 text-slate-600">الأقسام، الترتيب، البطاقات، وتبويب العقوبات.</p>
        </Link>
        <Link
          to="/dashboard/streamers"
          className={`group ${adminCard} p-4 text-right transition-colors hover:border-violet-200 hover:bg-violet-50/50`}
        >
          <Video className="mb-2 h-6 w-6 text-violet-600 transition-transform group-hover:scale-105" />
          <h2 className="font-display text-base font-bold text-slate-900">ستريمر منجر</h2>
          <p className="mt-1 text-xs leading-5 text-slate-600">إدارة صنّاع المحتوى، الصور، والترتيب على صفحة البث.</p>
        </Link>
        <Link
          to="/dashboard/gangs"
          className={`group ${adminCard} p-4 text-right transition-colors hover:border-violet-200 hover:bg-violet-50/50`}
        >
          <Swords className="mb-2 h-6 w-6 text-violet-600 transition-transform group-hover:scale-105" />
          <h2 className="font-display text-base font-bold text-slate-900">مدير العصابات</h2>
          <p className="mt-1 text-xs leading-5 text-slate-600">إضافة وتعديل وحذف العصابات وترتيبها كما في صفحة العصابات.</p>
        </Link>
        <Link
          to="/dashboard/vip-cars"
          className={`group ${adminCard} p-4 text-right transition-colors hover:border-violet-200 hover:bg-violet-50/50`}
        >
          <Car className="mb-2 h-6 w-6 text-violet-600 transition-transform group-hover:scale-105" />
          <h2 className="font-display text-base font-bold text-slate-900">مدير سيارات VIP</h2>
          <p className="mt-1 text-xs leading-5 text-slate-600">إضافة وتعديل وحذف سيارات الكتالوج وترتيبها كما في صفحة الزوار.</p>
        </Link>
        <Link
          to="/dashboard/institution"
          className={`group ${adminCard} p-4 text-right transition-colors hover:border-violet-200 hover:bg-violet-50/50`}
        >
          <Building2 className="mb-2 h-6 w-6 text-violet-600 transition-transform group-hover:scale-105" />
          <h2 className="font-display text-base font-bold text-slate-900">طواقم المؤسسات</h2>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            تحرير قائد ونائب وشبكة الأعضاء لكل فرع (صحة، أذرع الداخلية، رقابة، عدل، مبرمجين).
          </p>
        </Link>
        <Link
          to="/dashboard/applications"
          className={`group ${adminCard} p-4 text-right transition-colors hover:border-violet-200 hover:bg-violet-50/50`}
        >
          <ClipboardList className="mb-2 h-6 w-6 text-violet-600 transition-transform group-hover:scale-105" />
          <h2 className="font-display text-base font-bold text-slate-900">طلبات التقديم</h2>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            طلبات الدخول للسيرفر فقط (نماذج /apply). طلبات الوظائف تُراجع من طواقم المؤسسات.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHomePage;
