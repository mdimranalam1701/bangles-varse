import { X, Ruler, Phone } from "lucide-react";
import { useLang } from "../context/LangContext";

const SIZE_ROWS = [
    { indian: "2.2 (2-2)", inches: "2.12 in", cm: "5.4 cm", fitEn: "Extra Small / Petite", fitHi: "छोटा नाप (पतली कलाई)" },
    { indian: "2.4 (2-4)", inches: "2.25 in", cm: "5.7 cm", fitEn: "Small — Most Common Young Adult", fitHi: "साधारण छोटा नाप" },
    { indian: "2.6 (2-6)", inches: "2.37 in", cm: "6.0 cm", fitEn: "Medium — Most Popular Fit", fitHi: "मध्यम नाप (सबसे आम)" },
    { indian: "2.8 (2-8)", inches: "2.50 in", cm: "6.4 cm", fitEn: "Large — Comfortable Fit", fitHi: "बड़ा नाप" },
    { indian: "2.10 (2-10)", inches: "2.62 in", cm: "6.7 cm", fitEn: "Extra Large", fitHi: "सबसे बड़ा नाप" },
];

export default function SizeGuideModal() {
    const { sizeGuideOpen, closeSizeGuide, t, isHindi, storeConfig } = useLang();

    if (!sizeGuideOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-guide-title"
        >
            <div className="bg-ivory w-full max-w-xl rounded-2xl border border-parchment shadow-elevated overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
                <div className="bg-white border-b border-parchment px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-sindoor-50 text-sindoor-600 flex items-center justify-center">
                            <Ruler size={18} />
                        </div>
                        <h2 id="size-guide-title" className="text-2xl font-serif font-bold text-ink">
                            {t("sizeGuideTitle")}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={closeSizeGuide}
                        aria-label="Close size guide"
                        className="w-9 h-9 rounded-full bg-linen hover:bg-parchment flex items-center justify-center text-ink"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <p className="text-sm text-umber leading-relaxed">{t("sizeGuideSub")}</p>

                    {/* Visual Bangle Ruler Diagram */}
                    <div className="bg-white border border-parchment rounded-xl p-5 flex flex-col items-center">
                        <svg viewBox="0 0 360 175" className="w-full max-w-xs" aria-label="Inner diameter bangle measurement diagram">
                            <circle cx="180" cy="76" r="56" stroke="#9A6E1F" strokeWidth="10" fill="none" />
                            <circle cx="180" cy="76" r="51" stroke="#7C1D26" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                            <line x1="129" y1="76" x2="231" y2="76" stroke="#1C1613" strokeWidth="2" />
                            <polygon points="129,76 138,71 138,81" fill="#1C1613" />
                            <polygon points="231,76 222,71 222,81" fill="#1C1613" />
                            <rect x="132" y="142" width="96" height="22" rx="4" fill="#F3ECE1" stroke="#C9B9A3" />
                            <text x="180" y="157" textAnchor="middle" fill="#1C1613" fontSize="11" fontWeight="600">
                                {isHindi ? "अंदर की चौड़ाई (cm)" : "Inner Diameter (cm)"}
                            </text>
                        </svg>
                        <p className="text-xs text-umber text-center mt-2">
                            {isHindi
                                ? "ध्यान दें: कंगन के बाहर से नहीं, केवल अंदर के खाली हिस्से को नापें।"
                                : "Measure ONLY the empty inside circle across the widest middle point."}
                        </p>
                    </div>

                    {/* Size Chart */}
                    <div className="bg-white border border-parchment rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-linen text-xs uppercase text-umber">
                                <tr>
                                    <th className="px-4 py-3">{isHindi ? "नाप" : "Size"}</th>
                                    <th className="px-4 py-3">{isHindi ? "चौड़ाई (cm)" : "Inside (cm)"}</th>
                                    <th className="px-4 py-3">{isHindi ? "किसके लिए" : "Best Fit"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-parchment/70">
                                {SIZE_ROWS.map((row) => (
                                    <tr key={row.indian} className="hover:bg-ivory/70">
                                        <td className="px-4 py-3 font-bold text-sindoor-700">{row.indian}</td>
                                        <td className="px-4 py-3 font-medium text-ink tabular-nums">
                                            {row.cm} <span className="text-xs text-umber">({row.inches})</span>
                                        </td>
                                        <td className="px-4 py-3 text-umber">{isHindi ? row.fitHi : row.fitEn}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between gap-3 bg-brass-50 border border-brass-200 rounded-xl p-4">
                        <p className="text-xs text-ink font-medium">
                            {isHindi
                                ? "फिर भी समझ न आए? हमें फ़ोन करें — हम नाप तय करने में मदद करेंगे।"
                                : "Still unsure? Call our shop and we will guide you in 30 seconds."}
                        </p>
                        <a
                            href={`tel:${storeConfig.supportPhone}`}
                            className="btn-primary text-xs py-2 px-3 shrink-0"
                        >
                            <Phone size={14} /> {storeConfig.supportPhone}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

