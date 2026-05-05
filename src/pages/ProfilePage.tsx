import { useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { ImagePlus, Save } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePublicUser } from "@/contexts/PublicUserContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { TicketAttachment } from "@/lib/ticketsCenter";

const ProfilePage = () => {
  const { user, getProfile, updateProfile } = usePublicUser();
  const profile = getProfile();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [realName, setRealName] = useState(profile?.realName ?? "");
  const [cityName, setCityName] = useState(profile?.cityName ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [discordId, setDiscordId] = useState(profile?.discordId ?? "");
  const [age, setAge] = useState(String(profile?.age ?? ""));
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? "");

  if (!user) return <Navigate to="/" replace />;

  const readAttachment = async (file: File): Promise<TicketAttachment> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () =>
        resolve({
          id: crypto.randomUUID(),
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          dataUrl: String(r.result),
        });
      r.onerror = () => reject(new Error("read"));
      r.readAsDataURL(file);
    });

  const updateProfileInfo = () => {
    updateProfile({
      cityName,
      avatarUrl: avatarUrl || undefined,
    });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-[#f6f0fb] via-[#f8f4fc] to-[#fbf9fe] text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-4xl space-y-6 px-4 pb-16 pt-24 md:px-8">
        <div className="rounded-2xl border border-violet-200 bg-white p-5 text-right shadow-[0_12px_32px_-24px_rgba(54,22,79,0.35)]">
          <h1 className="font-display text-2xl font-bold text-slate-900">بروفايل المستخدم</h1>
          <p className="mt-1 text-sm text-muted-foreground">أهلاً {user.displayName} — هنا معلومات حسابك فقط.</p>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-white p-4 shadow-[0_12px_32px_-24px_rgba(54,22,79,0.35)]">
          <h2 className="mb-3 text-right font-display text-base font-semibold">الملف الشخصي</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-end gap-3">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const att = await readAttachment(f);
                  setAvatarUrl(att.dataUrl);
                }}
              />
              <Button type="button" variant="outline" className="border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100" onClick={() => avatarInputRef.current?.click()}>
                <ImagePlus className="ms-1 h-4 w-4" />
                صورة البروفايل
              </Button>
              <div className="h-14 w-14 overflow-hidden rounded-full border border-violet-200 bg-white">
                {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-right">الاسم داخل المدينة</Label>
              <Input value={cityName} onChange={(e) => setCityName(e.target.value)} className="border-violet-200 bg-white text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label className="text-right">الإيميل</Label>
              <Input value={email} readOnly className="border-violet-200 bg-slate-50 text-slate-700" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label className="text-right">Discord ID</Label>
              <Input value={discordId} readOnly className="border-violet-200 bg-slate-50 text-slate-700" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label className="text-right">العمر</Label>
              <Input value={age} readOnly className="border-violet-200 bg-slate-50 text-slate-700" />
            </div>
            <div className="space-y-2">
              <Label className="text-right">الاسم الحقيقي</Label>
              <Input value={realName} readOnly className="border-violet-200 bg-slate-50 text-slate-700" />
            </div>
            <div className="flex justify-end">
              <Button type="button" className="bg-violet-600 text-white hover:bg-violet-700" onClick={updateProfileInfo}>
                <Save className="ms-1 h-4 w-4" />
                حفظ البروفايل
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer forceLight />
    </div>
  );
};

export default ProfilePage;
