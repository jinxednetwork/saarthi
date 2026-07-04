/** Quiet page footer (design). Links and the right-hand line vary per screen. */
export function AppFooter({
  links,
  right,
}: {
  links: string[];
  right: string;
}) {
  return (
    <section className="mx-auto max-w-[1440px] px-10 pb-16 pt-12">
      <div className="flex items-center justify-between text-[12.5px] text-faint">
        <div className="flex items-center gap-5">
          <span>Saarthi v0.4 · Pilot programme, Government of India</span>
          <span className="text-[#DCD3BF]">·</span>
          {links.map((l) => (
            <a key={l} href="#" className="text-muted-foreground no-underline hover:text-primary">
              {l}
            </a>
          ))}
        </div>
        <div>{right}</div>
      </div>
    </section>
  );
}
