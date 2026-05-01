import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Facebook, Ghost, Instagram, Sparkles, Youtube } from "lucide-react";
import ReflectiveCard from "@/components/ReflectiveCard";
import { Button } from "@/components/ui/button";

const streamers = [
  {
    name: "F-0",
    role: "صانع محتوى معتمد",
    bio: "بث مباشر على Kick.",
    streamUrl: "https://kick.com/alshayeeb1",
    image: "/hg.webp",
  },
  {
    name: "F-1",
    role: "صانع محتوى معتمد",
    bio: "بث مباشر على Kick.",
    streamUrl: "https://kick.com/ayla-ab",
    image: "/54aa9fff-9262-404a-ae4b-116542f7d571-fullsize.webp",
  },
  {
    name: "جون سميث",
    role: "صانع محتوى معتمد",
    bio: "بث مباشر على Kick.",
    streamUrl: "https://kick.com/produbai",
    image: "/02685ed8-6c04-4c89-993c-06f81df59b63-fullsize.webp",
  },
  {
    name: "اسمر",
    role: "صانع محتوى معتمد",
    bio: "بث مباشر على Kick.",
    streamUrl: "https://kick.com/1asmar1",
    image: "/bb8acb02-b4d0-44d0-820e-569b7cf67b03-fullsize.webp",
    socials: {
      youtube: "https://youtube.com",
      instagram: "https://instagram.com",
      snapchat: "https://snapchat.com",
      facebook: "https://facebook.com",
    },
  },
  {
    name: "ابو عرب",
    role: "صانع محتوى معتمد",
    bio: "بث مباشر على Kick.",
    streamUrl: "https://kick.com/k1krm",
    image: "/4cf98d7e-34fd-4f84-ac21-643fb80d5b82-fullsize.webp",
  },
  {
    name: "النور",
    role: "صانع محتوى معتمد",
    bio: "بث مباشر على Kick.",
    streamUrl: "https://kick.com/al-nooor",
    image: "/c02263ea-636d-43bb-a7f0-abeee47f8a6d-fullsize.webp",
  },
  {
    name: "عمر صلاحات",
    role: "صانع محتوى معتمد",
    bio: "بث مباشر على Kick.",
    streamUrl: "https://kick.com/salahat8",
    image: "/5ae78459-1a81-4c71-9113-f54a2e73c266-fullsize.webp",
  },
  {
    name: "كوسوفي",
    role: "صانع محتوى معتمد",
    bio: "بث مباشر على Kick.",
    streamUrl: "https://kick.com/ogxkosovy",
    image: "/e670f797-a27c-4f78-b237-778c4bb4b43d-fullsize_1.webp",
  },
  {
    name: "ريكسن",
    role: "صانع محتوى معتمد",
    bio: "بث مباشر على Kick.",
    streamUrl: "https://kick.com/ryxenx",
    image: "/58354d06-4da1-4a93-a091-1b89f7fe65e0-fullsize.webp",
  },
  {
    name: "برلين",
    role: "صانع محتوى معتمد",
    bio: "بث مباشر على Kick.",
    streamUrl: "https://kick.com/br-berlin",
    image: "/bb0cfddc-f84e-4916-a3d9-0a6e40f98c22-fullsize.webp",
  },
  {
    name: "ابو العبد",
    role: "صانع محتوى معتمد",
    bio: "بث مباشر على Kick.",
    streamUrl: "https://kick.com/aboel3abed",
    image: "/99d0feb3-1054-4f3c-8f62-149bbc80663d-fullsize.webp",
  },
  {
    name: "دارك انجل",
    role: "صانع محتوى معتمد",
    bio: "بث مباشر على Kick.",
    streamUrl: "https://kick.com/adnanko",
    image: "/c28eea64-9bbf-4772-976e-9a1f889293e0-fullsize.webp",
  },
  {
    name: "دونقل",
    role: "صانع محتوى معتمد",
    bio: "بث مباشر على Kick.",
    streamUrl: "https://kick.com/don9ol",
    image: "/cb920be8-f314-433b-a4e4-a1c41e52775f-fullsize.webp",
  },
  {
    name: "سوبزي",
    role: "صانع محتوى معتمد",
    bio: "بث مباشر على Kick.",
    streamUrl: "https://kick.com/subzi-tv",
    image: "/a077cb35-ee9d-42e0-9564-0d12d3a40b52-fullsize.webp",
  },
  {
    name: "جيمس مورفي",
    role: "صانع محتوى معتمد",
    bio: "بث مباشر على Kick.",
    streamUrl: "https://kick.com/kazroo",
    image: "/7b26fe2e-373a-42cf-be4c-1ed4e465d488-fullsize.webp",
  },
  {
    name: "حربيش",
    role: "صانع محتوى معتمد",
    bio: "بث مباشر على Kick.",
    streamUrl: "https://kick.com/harbash12",
    image: "/9f018b3a-2793-4749-b5b3-bab3ecb8e830-fullsize.webp",
  },
];

const featuredStreamerName = "اسمر";
const featuredStreamer = streamers.find((streamer) => streamer.name === featuredStreamerName);
const otherStreamers = streamers.filter((streamer) => streamer.name !== featuredStreamerName);

const StreamersPage = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <main className="pb-20">
        <section className="relative h-[46vh] min-h-[300px] max-h-[520px] overflow-hidden">
          <img
            src="/INF-CONECT-LOGO.gif"
            alt="صورة تعبر عن صناع المحتوى"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/10 to-background/85" />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background/55 to-transparent backdrop-blur-sm" />
          <div className="absolute inset-x-0 -bottom-8 h-32 bg-gradient-to-t from-background/90 via-background/60 to-transparent backdrop-blur-sm" />
          <div className="absolute inset-x-0 bottom-8 flex justify-center px-4">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-center drop-shadow-[0_8px_24px_hsl(var(--background)/0.85)]">
              <span className="text-gradient-neon">صنّاع المحتوى</span>
            </h1>
          </div>
        </section>

        <section className="w-full px-4 md:px-8 xl:px-12 mt-10">
          <div className="glass-panel rounded-2xl p-6 md:p-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              بروفايلات <span className="text-gradient-neon">صنّاع المحتوى</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              لكل صانع محتوى بطاقة تعريفية مختصرة مع رابط البث المباشر الخاص فيه.
            </p>

            {featuredStreamer && (
              <div className="mt-6">
                <div className="glass-panel rounded-2xl border border-primary/35 bg-gradient-to-br from-primary/10 via-background/70 to-background/55 p-4 md:p-6">
                  <div className="grid items-center gap-6 md:grid-cols-[400px_1fr]">
                    <div className="order-1 md:order-2 flex justify-center md:justify-end md:pr-1">
                      <img
                        src={featuredStreamer.image}
                        alt={featuredStreamer.name}
                        className="h-[350px] w-full max-w-[400px] rounded-2xl object-cover border-2 border-primary/45 shadow-[0_10px_36px_hsl(var(--primary)/0.26)]"
                        loading="lazy"
                      />
                    </div>

                    <div className="order-2 md:order-1 text-center md:text-right">
                      <div className="inline-flex items-center rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-display tracking-[0.18em] text-primary">
                        THE KING
                      </div>
                      <h3 className="mt-3 font-display text-4xl md:text-5xl font-bold">{featuredStreamer.name}</h3>
                      <p className="mt-2 text-primary font-display tracking-[0.16em]">{featuredStreamer.role}</p>
                      <p className="mt-3 text-muted-foreground leading-8 max-w-2xl md:mr-0 md:ml-auto">
                        صانع محتوى مميز في المدينة. تابع قنواته الرسمية على المنصات التالية.
                      </p>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <a
                          href={featuredStreamer.socials?.youtube ?? "https://youtube.com"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/55 bg-background/55 px-4 py-3 text-sm transition-colors hover:border-primary/45 hover:bg-background/75"
                        >
                          <Youtube className="h-4 w-4 text-red-400" />
                          يوتيوب
                        </a>
                        <a
                          href={featuredStreamer.socials?.instagram ?? "https://instagram.com"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/55 bg-background/55 px-4 py-3 text-sm transition-colors hover:border-primary/45 hover:bg-background/75"
                        >
                          <Instagram className="h-4 w-4 text-pink-400" />
                          انستغرام
                        </a>
                        <a
                          href={featuredStreamer.socials?.snapchat ?? "https://snapchat.com"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/55 bg-background/55 px-4 py-3 text-sm transition-colors hover:border-primary/45 hover:bg-background/75"
                        >
                          <Ghost className="h-4 w-4 text-yellow-300" />
                          سناب شات
                        </a>
                        <a
                          href={featuredStreamer.socials?.facebook ?? "https://facebook.com"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/55 bg-background/55 px-4 py-3 text-sm transition-colors hover:border-primary/45 hover:bg-background/75"
                        >
                          <Facebook className="h-4 w-4 text-blue-400" />
                          فيسبوك
                        </a>
                      </div>

                      <Button asChild className="mt-5 w-full sm:w-auto bg-gradient-neon text-primary-foreground font-display tracking-widest">
                        <a href={featuredStreamer.streamUrl} target="_blank" rel="noreferrer">
                          رابط بث Kick
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {otherStreamers.map((streamer) => (
                <ReflectiveCard key={streamer.name} {...streamer} />
              ))}
            </div>
          </div>
        </section>

        <section className="w-full px-4 md:px-8 xl:px-12 mt-10">
          <div className="glass-panel rounded-xl p-6 md:p-8 flex items-start gap-4">
            <Sparkles className="h-6 w-6 text-primary mt-1" />
            <p className="text-muted-foreground">
              قريبًا سيتم إضافة نموذج رسمي للتقديم كصانع محتوى مع متطلبات القبول والمزايا التفصيلية.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default StreamersPage;
