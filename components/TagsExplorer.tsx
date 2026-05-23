"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Tag, Filter, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const ALL_TAGS = ["0930","1 Day Shoot","1080P","18 Years Old","19 Years Old","2 Ejaculation","20 Years Old","20S","30S","3P","3P&4P","4 Hours Or More","40S","4HR+","4K","4P","50S","60Fps","69","AV Actress","Acme Orgasm","Acme&Orgasm","Actress Best Compilation","Actress With Dildo","Actress With Vibrator","Affair","Aika Yamagishi","Amateur","Anal","Anal Hentai","Anicos","Animals","Annual","Aphrodisiac","Apron","Ass Fetish","Athlete","Atm","BBW","BIG BOOBS","BLOW JOB","BOOB JOB","Baby Face","Back","Bag","Bakugou","Ball Licking","Bath","Bathroom","Beautiful Ass","Beautiful Breasts","Beautiful Butt","Beautiful Butt (Beautiful Ass)","Beautiful Butt (beautiful Ass)","Beautiful Buttocks","Beautiful Buttocks (Beautiful Ass)","Beautiful Buttocks (beautiful Ass)","Beautiful Girl","Beautiful Legs","Beautiful Legs (Beautiful Feet)","Beautiful Legs (beautiful Feet)","Beautiful Skin","Beauty","Beauty Shop","Best","Best Omnibus","Best&Omnibus","Big Ass","Big Boobs","Big Breasts","Big Cock","Big Tits","Bikyaku","Bitch","Black","Black Actor","Black Hair","Black Silk","Black Stockings","Blonde","Bloomer","Bloomers","Blowjob","Blu-Ray","Bondage","Boobs","Bound","Boys","Breast Milk","Breasts","Bride&Young Wife","Bristles","Brown Hair","Bukkake","Bunny Girl","Busty","Busty Fetish","Butt","CENSORED","CREAMPIE","Car Sex","Cat Ears","Censored","Cheating","Chinese AV","Chippai","Cleaning Blowjob","Climax","Close Up","Close-Up","Clothes","College Girls","Competitive Swimming","Compilation","Conceived","Confinement","Convulsions","Cosplay","Couple","Cowgirl","Cowgirl Position","Creampie","Creampie (Bareback","Creampie (No Condom","Creampie (bareback","Creampie Hentai","Cross Dressing","Cross-Dressing","Cruel","Cuckold","Cuckolded","Cum","Cum Eating","Cum In Mouth","Cum In Mouth (Internal Ejaculation)","Cum In Mouth (Internal Oral Ejaculation)","Cum Inside Without Condom","Cum-On-Face","Cunnilingus","Cunnilingus (Licking Pussy)","Cute","Danger Day","Date","Dating","Debut Production","Debut Work","Deep Throat","Deep Throating","Delusion","Digital Mosaic","Dildo","Dirty Talk","Dirty Words","Divine Milk","Documentary","Dom","Drag","Drama","Drinking Party","E-Cup","Eimi Fukada","Ekiben","Electric Massager","Enema","Entertainer","Erotic Wear","Esthetic Massage","Esthetics","Evil","Excellent Style","Exclusive","Exposure","F Cup","FANTASY","FC2PPV","Face Reveal","Facesitting","Facial","Facials","Fair Skin","Fan Appreciation","Fellatio","Female Boss","Female Investigator","Female Molester","Female Teacher","Fetish","Finger Fuck","Finger Insertion","Fingering","First Back","First Shot","Fishnet","Flat Chest (Small Breasts","Flat Chest (small Breasts","Flight Attendant","Footjob","For Distribution Only","Foreign Object Insertion","Full Hd (Fhd)","Furnace","Futanari Hentai","G Cup","GLASSES","Gal","Garter Stockings","Giant Breasts","Girl","Glasses","Gym Clothes","H Cup","HAND JOB","HD","Hairless","Hairless (Bald Pussy)","Hairless (Bald Tiger)","Hairless (bald)","Hairless (White Tiger)","Hairless (bald)","Hameha","Hametio","Handjob","Hardcore","Hentai","High Quality","High Vision","Hikari Azusa","Hochari","Hostess","Hot Spring","Hot Springs","Hotel","Housewife","Huge Breasts","Huge Butt","Huge Cock","Humiliation","Idol","Idols And Celebrities","Ikase Game","Image Video","Impromptu Sex","Incest","Incest Hentai","Individual Photography","Innocent","Instant","Instructor","Internal Cumshot)","Internal Ejaculation","Internal Ejaculation)","Irama","Iramachio","Japanese Clothes","Jd","Kaoru Yasui","Kimono","Kimono&Mourning","Kiss","Kissing","Knee Socks","Kusuko","Lady","Landlady&Hostess","Leg Fetish","Leotard","Lesbian","Lesbian Kiss","Lewd","Licking Pussy","Lingerie","Loli","Long Boots","Long Hair","Long Legs","Lotion","M Woman","Maid","Manguri Flip","Married Woman","Masochist","Massage","Massage And Refreshment","Masturbation","Masturbation (Jerking Off)","Mature","Mature Woman","Men's","Men's Esthetics","Men's Health Girl","Micro Breasts)","Milf","Milf Hentai","Mina Kitano","Mini","Missionary Position","Mistress","Model","Momotaro Video Publishing","Mosaic Included","Mother","Mouth Cumshot","Multiple","Multiple Story","Muscle","Musumegacha","Nampa","Nana Yagi","Nao Jinguji","Nasty&Hardcore","Neat","Neat System","Nene Tanaka","Netorare","Netori","Netori・Netorare","New Half","Newcomer","No Bra","No Pills","Nozomi Ishihara","Ntr","Nurse","Nymphomaniac","OL","Office Lady","Ohogoe","Oil","Ol","Older Sister","Omnibus","Oneesan","Oral Creampie","Oral Cum","Oral Sex","Orgy","Original","Original Collaboration","Original Video","Oshishino Amateur","Other Fetish","Other Fetishes","Outdoor","Outdoor Exposure","Outdoors","Over-the-Knee Socks","Over-the-knee Socks","PLOT","POV","PUBLIC SEX","Paipan","Panchira","Pantyhose","Pantyhose And Tights","Peeing","Personal Photo","Petite","Petite Breasts)","Pheramono","Photographed By","Pick-Up","Planning","Plum 40% Off Sale","Plump","Plump Woman","Pochari","Pornstar","Posts","Pov","Prank","Pregnancy","Pregnant Women","Promiscuity","Promiscuous","Prostitute","Prostitutes","Pubic Hair","Public Sex","Pussy Licking","Raw","Raw Creampie","Raw Hame","Raw Sex","Reducing Mosaic","Remaining Wazuka","Reproduction Prevention Measures Completed","Restraint","Reverse Nan","Reversed Role","Rolling Back Eyes&Fainting","Rori-Kei","SCHOOL GIRL","SM","Sailor Suit","Sale Items","Scat","School Girls Hentai","School Swimsuit","School Swimsuits","School Uniform","Schoolgirl","Secretary","Seeded","Sefure","Sensitive","Sexy","Shame","Shaved","Short Hair","Shower","Silk Stockings","Sister","Six Nine","Slender","Slim","Slut","Sm","Small Breasts","Small Breasts (Poor Breasts","Snow White Skin","Snow-White Skin","Snow-white Skin","Snowy White Skin","Sod Group 40% Off Sale","Soggy Masturbation","Sokkurisan","Sold Out","Solowork","Spanking","Sport","Sports","Squirting","Stepmother","Stewardess","Stewardess Ca","Stockings","Streaming Compatible","Student Girl","Subjective","Subjectivity","Submissive Men","Submissive Woman","Super Vip","Suspender Stockings","Swallow","Swallow Cum","Sweat","Swimsuit","Swimwear","THREESOME","TOYS","Tall","Tall Figure","Tall Stature","Tattoo","Teen (18+)","Thigh-High Socks","Thirty Years Old","Threesome","Tit Fuck","Titjob","Tits","Titty Fuck","Toriorosh","Torture","Toy","Toys","Toys And Foreign Objects Insertion","Training","Transsexual","True Story","Tsukasa Aoi","Ultra-Huge Tits","Uncensored","Uncensored L**ked","Underwear","Uniform","University Student","Urination","Various Occupations","Various Professions","Vibe","Vip","Virgin","Virgin Man","Voyeur","Voyeurism","Waist","White Actress","Woman's Nature","Women's Body Sharing Club","Words Of Reproach","X-RAY","Young Housewife","Young Wife","Yu Shinoda","Yua Mikami","Yui Hatano","Yukata","Yuri Hentai"].filter((tag, idx, arr) => arr.indexOf(tag) === idx);

const ALPHABET = ["All", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
    "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "#"];


export default function TagsExplorer() {
    const [search, setSearch] = useState("");
    const [letter, setLetter] = useState("All");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Featured tags for the top section
    const featuredTags = ["Cosplay", "Amateur", "Beautiful Ass", "Big Boobs", "Creampie", "Student Girl", "Nurse", "Milf"];

    const groupedTags = useMemo(() => {
        const groups: { [key: string]: string[] } = {};
        
        const filtered = ALL_TAGS.filter(tag => 
            search === "" || tag.toLowerCase().includes(search.toLowerCase())
        );

        filtered.forEach(tag => {
            const firstChar = tag[0].toUpperCase();
            const key = /^[A-Z]/.test(firstChar) ? firstChar : "#";
            if (!groups[key]) groups[key] = [];
            groups[key].push(tag);
        });

        if (letter !== "All") {
            const result: { [key: string]: string[] } = {};
            if (groups[letter]) result[letter] = groups[letter];
            return result;
        }

        return groups;
    }, [search, letter]);

    return (
        <section className="flex flex-col gap-12 w-full">
            {/* 1. HERO SECTION & SEARCH */}
            <div className="flex flex-col gap-8 items-center max-w-5xl mx-auto w-full px-4">
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/20 rounded-full">
                        <Tag className="w-3 h-3 text-primary" />
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Premium Index</span>
                    </div>
                    <h2 className="text-2xl md:text-5xl font-black text-slate-100 uppercase tracking-tighter leading-none">
                        The <span className="text-primary italic">A-Z Library.</span>
                    </h2>
                </div>

                <div className="w-full flex flex-col gap-6 bg-white/[0.02] p-5 md:p-8 rounded-[2.5rem] border border-white/[0.06] shadow-md relative overflow-hidden group">
                    <div className="flex overflow-x-auto no-scrollbar gap-1.5 px-1 pb-1">
                        {ALPHABET.map(l => (
                            <button
                                key={l}
                                onClick={() => { setLetter(l); setSearch(""); }}
                                className={`flex-shrink-0 min-w-[38px] h-9 flex items-center justify-center rounded-xl text-[10px] font-black transition-all duration-300 border ${
                                    letter === l
                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 cursor-pointer"
                                        : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.1] hover:text-white border-white/[0.05] cursor-pointer"
                                }`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Find specific labels..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/25 transition-all font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* 2. FEATURED SECTION */}
            {letter === "All" && search === "" && isClient && (
                <div className="max-w-7xl mx-auto w-full px-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Trending Categories</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {featuredTags.map((tag) => (
                            <Link
                                key={tag}
                                href={`/search?q=${encodeURIComponent(tag)}`}
                                className="relative h-16 md:h-24 flex items-center justify-center bg-white/[0.02] border border-white/[0.06] rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/30 hover:bg-primary/[0.05] transition-all group overflow-hidden"
                            >
                                <span className="relative z-10 text-[10px] md:text-xs font-black text-slate-400 group-hover:text-primary uppercase tracking-widest">{tag}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. ALPHABETICAL GROUPS */}
            <div className="max-w-7xl mx-auto w-full px-6 flex flex-col gap-8 mb-24">
                {isClient && Object.keys(groupedTags).sort().map(char => (
                    <div key={char} className="flex flex-col md:flex-row gap-4 md:gap-8 border-t border-white/[0.06] pt-6">
                        <div className="md:w-20 shrink-0">
                            <div className="sticky top-28 flex items-baseline gap-2">
                                <span className="text-4xl font-black text-primary/20 leading-none">{char}</span>
                                <div className="h-px flex-1 bg-white/[0.06] md:hidden" />
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                            {groupedTags[char].map(tag => (
                                <Link
                                    key={tag}
                                    href={`/search?q=${encodeURIComponent(tag)}`}
                                    className="px-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-[10px] font-bold text-slate-300 hover:text-primary hover:bg-primary/[0.05] hover:border-primary/20 transition-all uppercase tracking-wider truncate"
                                >
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
}
