import Link from "next/link";
import TagsExplorer from "@/components/TagsExplorer";
import { 
    LayoutGrid, 
    Zap, 
    Flame, 
    Star, 
    Layers, 
    Search, 
    Compass,
    TrendingUp,
    ShieldCheck,
    Eye,
    Globe,
    Film
} from "lucide-react";

export const metadata = {
    title: "Explore Video Categories — Cuanflix",
    description: "Browse 500+ unique genres and premium labels on Cuanflix. From official releases to amateur collections — discover your next cinematic journey with our curated database.",
};

const CATEGORY_GROUPS = [
    {
        title: "Indonesian Collections",
        description: "Kategori & genre video Indo terpopuler",
        items: [
            { id: "indo-all", name: "Bokep Indo", icon: Flame, count: "15k+", href: "/indo" },
            { id: "indo-viral", name: "Indo Viral", icon: Zap, count: "8k+", href: "/search?q=indo+viral" },
            { id: "indo-hijab", name: "Indo Hijab", icon: Star, count: "6k+", href: "/search?q=indo+hijab" },
            { id: "indo-sma", name: "Indo SMA", icon: Compass, count: "4k+", href: "/search?q=indo+sma" },
            { id: "indo-skandal", name: "Indo Skandal", icon: TrendingUp, count: "5k+", href: "/search?q=indo+skandal" },
            { id: "indo-amatir", name: "Indo Amatir", icon: Eye, count: "7k+", href: "/search?q=indo+amatir" },
        ]
    },
    {
        title: "Trending & Streaming Networks",
        description: "Kategori & genre koleksi streaming pilihan terlengkap",
        items: [
            { id: "net-terbaru", name: "Indo Terbaru", icon: Zap, count: "10k+", href: "/search?q=indo+terbaru" },
            { id: "net-sma", name: "Indo SMA Hot", icon: Compass, count: "7k+", href: "/search?q=sma" },
            { id: "net-barat", name: "Bokep Barat", icon: Globe, count: "14k+", href: "/search?q=barat" },
            { id: "net-viralabg", name: "Viral ABG", icon: Flame, count: "9k+", href: "/search?q=viralabg" },
            { id: "net-bokephub", name: "Bokephub", icon: Layers, count: "5k+", href: "/search?q=bokephub" },
            { id: "net-avtub", name: "AVTub", icon: Film, count: "6k+", href: "/search?q=avtub" },
        ]
    },
    {
        title: "JAV & International",
        description: "Most popular global content classifications",
        items: [
            { id: 1, name: "Censored", icon: ShieldCheck, count: "12k+", href: "/categories/1" },
            { id: 2, name: "Uncensored", icon: Eye, count: "8k+", href: "/categories/2" },
            { id: 3, name: "Leaked", icon: Zap, count: "1.2k", href: "/categories/3" },
            { id: 4, name: "Amateur", icon: Star, count: "5k+", href: "/categories/4" },
            { id: 5, name: "Chinese AV", icon: Globe, count: "3k+", href: "/categories/5" },
            { id: 6, name: "Hentai", icon: Flame, count: "2.5k", href: "/categories/6" },
            { id: 7, name: "English Sub", icon: Layers, count: "4k+", href: "/categories/7" },
        ]
    }
];

const TRENDING_TAGS = [
    { name: "Indo Viral", count: "8,920" },
    { name: "Indo Hijab", count: "6,410" },
    { name: "Bokep Barat", count: "5,820" },
    { name: "Beautiful Breasts", count: "4,182" },
    { name: "Viral ABG", count: "4,162" },
    { name: "Indo SMA", count: "3,890" },
    { name: "Blowjob", count: "4,010" },
    { name: "Indo Skandal", count: "2,980" },
];

export default function CategoriesPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#0A0A0B]">
            {/* SEO Visual Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute inset-0 bg-dot-grid opacity-20" />
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-8 w-full flex flex-col gap-8 md:gap-16 pt-16 md:pt-24 pb-16 md:pb-24 relative">
                
                {/* Hero Section / Header */}
                <div className="flex flex-col items-center text-center gap-4 md:gap-6 max-w-3xl mx-auto">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full">
                        <Compass className="w-3.5 h-3.5 text-primary animate-spin-slow" />
                        <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em]">Discovery Engine</span>
                    </div>
                    <div className="flex flex-col gap-2 md:gap-3">
                        <h1 className="text-3xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                            Explore <span className="text-primary italic">Everything.</span>
                        </h1>
                        <p className="text-slate-500 text-[11px] md:text-sm font-bold uppercase tracking-widest leading-relaxed">
                            Meticulously indexed <span className="text-slate-400">500+ unique genres</span> & labels.
                        </p>
                    </div>
                </div>

                {/* Sub-Bab 1, 2, 3: Featured Categories */}
                {CATEGORY_GROUPS.map((group, idx) => (
                    <section key={idx} className="flex flex-col gap-6 md:gap-8">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="w-4 h-4 text-primary" />
                                <h2 className="text-base md:text-xl font-black text-white uppercase tracking-tight">{group.title}</h2>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{group.description}</p>
                        </div>
                        
                        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-3 md:grid md:grid-cols-3 lg:grid-cols-6 md:gap-4 pb-2">
                            {group.items.map((item) => (
                                <Link
                                    key={item.id}
                                    href={item.href || `/categories/${item.id}`}
                                    className="group relative flex flex-col flex-shrink-0 w-[140px] md:w-auto items-center justify-center gap-3 py-6 md:py-8 px-3 md:px-4 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all duration-500 text-center overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        <item.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                                    </div>
                                    <div className="flex flex-col gap-0.5 relative z-10">
                                        <span className="text-[11px] md:text-sm font-black text-white tracking-tight uppercase">
                                            {item.name}
                                        </span>
                                        <span className="text-[9px] text-slate-500 font-bold group-hover:text-primary transition-colors">
                                            {item.count} Titles
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}

                {/* Sub-Bab 2: Trending Quick Access */}
                <section className="flex flex-col gap-6 md:gap-8">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5 text-primary" />
                            <h2 className="text-[14px] md:text-lg font-black text-white uppercase tracking-tight">Trending Topics</h2>
                        </div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Highly searched labels</p>
                    </div>

                    <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-3 md:grid md:grid-cols-4 md:gap-4 pb-2">
                        {TRENDING_TAGS.map((tag) => (
                            <Link
                                key={tag.name}
                                href={`/search?q=${encodeURIComponent(tag.name)}`}
                                className="group flex flex-shrink-0 w-[160px] md:w-auto items-center justify-between px-4 py-3.5 md:px-6 md:py-4 rounded-xl bg-zinc-900/20 border border-white/5 hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-300"
                            >
                                <span className="text-[10px] md:text-xs font-bold text-slate-400 group-hover:text-primary transition-colors uppercase tracking-wider truncate mr-2">
                                    {tag.name}
                                </span>
                                <span className="text-[9px] font-black text-slate-500 group-hover:text-primary/60 transition-all">
                                    {tag.count}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Sub-Bab 3: The Deep Explorer */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <TagsExplorer />

            </main>
        </div>
    );
}
