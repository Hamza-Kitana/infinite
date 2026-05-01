const Footer = () => {
  return (
    <footer dir="rtl" className="relative border-t border-primary/20 py-10 mt-20">
      <div className="w-full px-4 md:px-8 xl:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-neon p-[2px]">
            <div className="h-full w-full rounded-[6px] bg-background flex items-center justify-center">
              <span className="font-latin-display font-black text-primary">∞</span>
            </div>
          </div>
          <div>
            <div className="font-latin-display font-bold tracking-widest text-sm">INFINITE CITY</div>
            <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} — كل الحقوق محفوظة</div>
          </div>
        </div>
        <div className="font-display text-[10px] tracking-[0.3em] text-muted-foreground">
          BUILT WITH ⚡ FOR THE COMMUNITY
        </div>
      </div>
    </footer>
  );
};

export default Footer;
