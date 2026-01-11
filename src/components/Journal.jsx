import Link from "next/link";

const journalData = [
  {
    id: 1,
    title: "Golden Hour: Crafting Timeless Earrings",
    subtitle: "Design Story",
    description:
      "Discover how our master artisans shape precious metals into modern heirlooms inspired by vintage silhouettes.",
    image: "https://picsum.photos/id/1080/600/800"
  },
  {
    id: 2,
    title: "Behind the Sparkle: Diamond Selection Guide",
    subtitle: "Education",
    description:
      "A closer look at how we ethically source and hand-pick every diamond for clarity, cut and brilliance.",
    image: "https://picsum.photos/id/1062/600/800"
  },
  {
    id: 3,
    title: "Atelier Moments: The Making of Bridal Rings",
    subtitle: "Process",
    description:
      "Step inside the studio where engagement and wedding bands are carefully crafted one detail at a time.",
    image: "https://picsum.photos/id/1074/600/800"
  },
  {
    id: 4,
    title: "Sterling Silver: Care & Longevity Tips",
    subtitle: "Aftercare",
    description:
      "Learn simple techniques to preserve the shine and finish of your favorite silver jewellery pieces.",
    image: "https://picsum.photos/id/1050/600/800"
  }
];

export default function Journal() {
  return (
    <section className="w-full px-6 py-12">
      
      {/* Top Row */}
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-4xl md:text-6xl font-light uppercase tracking-[0.2em]">
          The Journal
        </h2>

        <Link
          href="/journal"
          className="text-xs uppercase tracking-[0.3em] border-b border-black"
        >
          Read The Journal
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {journalData.map((item) => (
          <div key={item.id} className="flex flex-col gap-4">
            
            <div className="overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-[350px] object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>

            <p className="text-xs uppercase tracking-[0.2em]">
              {item.subtitle}
            </p>

            <h3 className="text-sm uppercase tracking-[0.15em] leading-relaxed">
              {item.title}
            </h3>

            <p className="text-xs leading-relaxed text-zinc-600">
              {item.description}
            </p>

          </div>
        ))}
      </div>

    </section>
  );
}
