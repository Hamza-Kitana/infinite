import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

/** كاروسيل مشترك للصور — يُستخدم في بلوكات المتجر (بيوت/بكجات/استثمار) */
export function StoreGalleryCarousel({ urls, alt }: { urls: string[]; alt: string }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const sync = () => setCurrent(api.selectedScrollSnap());
    sync();
    api.on("select", sync);
    api.on("reInit", sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  if (urls.length === 0) return null;

  return (
    <div className="relative">
      <Carousel
        key={urls.join("|")}
        setApi={setApi}
        opts={{ align: "center", loop: urls.length > 1, skipSnaps: false }}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {urls.map((src, i) => (
            <CarouselItem key={`${src}-${i}`} className="basis-full pl-0">
              <div className="overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-b from-muted/40 to-muted/70 shadow-inner ring-1 ring-white/5">
                <div className="relative aspect-[4/3] w-full">
                  <img
                    src={src}
                    alt={`${alt} — صورة ${i + 1}`}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {urls.length > 1 ? (
          <>
            <CarouselPrevious
              type="button"
              className="left-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 border-primary/35 bg-background/90 text-foreground shadow-lg backdrop-blur-sm hover:bg-background disabled:opacity-40 sm:left-3 sm:h-11 sm:w-11"
            />
            <CarouselNext
              type="button"
              className="right-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 border-primary/35 bg-background/90 text-foreground shadow-lg backdrop-blur-sm hover:bg-background disabled:opacity-40 sm:right-3 sm:h-11 sm:w-11"
            />
          </>
        ) : null}
      </Carousel>

      {urls.length > 1 ? (
        <div className="mt-2 flex flex-col items-center gap-2 sm:mt-3">
          <p className="font-display text-[11px] text-muted-foreground sm:text-xs">
            <span className="tabular-nums text-foreground">{current + 1}</span> / {urls.length}
            <span className="ms-2 text-muted-foreground/75">سحب أو أسهم</span>
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {urls.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => api?.scrollTo(i)}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  i === current
                    ? "w-8 bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
                    : "w-2.5 bg-muted-foreground/35 hover:bg-muted-foreground/55",
                )}
                aria-label={`انتقل إلى الصورة ${i + 1}`}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default StoreGalleryCarousel;
