import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations } from "../i18n/translations";
import { configAPI } from "../services/api";

const LangContext = createContext(null);

export function LangProvider({ children }) {
    const [lang, setLang] = useState(() => localStorage.getItem("bv_lang") || "en");
    const [storeConfig, setStoreConfig] = useState({
        supportPhone: "9876543210",
        supportWhatsapp: "919876543210",
        razorpayEnabled: false,
        razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
    });
    const [quickOrderState, setQuickOrderState] = useState(null);
    const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

    useEffect(() => {
        configAPI
            .getPublic()
            .then(({ data }) => {
                if (data?.data) {
                    setStoreConfig((prev) => ({ ...prev, ...data.data }));
                }
            })
            .catch(() => {});
    }, []);

    const toggleLang = useCallback(() => {
        setLang((prev) => {
            const next = prev === "en" ? "hi" : "en";
            localStorage.setItem("bv_lang", next);
            return next;
        });
    }, []);

    const setLanguage = useCallback((next) => {
        const val = next === "hi" ? "hi" : "en";
        localStorage.setItem("bv_lang", val);
        setLang(val);
    }, []);

    const t = useCallback(
        (key, fallback) => translations[lang]?.[key] || translations.en[key] || fallback || key,
        [lang]
    );

    const openQuickOrder = useCallback((product, size, quantity = 1) => {
        setQuickOrderState({
            product,
            size: size || product?.sizes?.[0] || "2.6",
            quantity,
        });
    }, []);

    const closeQuickOrder = useCallback(() => setQuickOrderState(null), []);

    return (
        <LangContext.Provider
            value={{
                lang,
                isHindi: lang === "hi",
                toggleLang,
                setLanguage,
                t,
                storeConfig,
                quickOrderState,
                openQuickOrder,
                closeQuickOrder,
                sizeGuideOpen,
                openSizeGuide: () => setSizeGuideOpen(true),
                closeSizeGuide: () => setSizeGuideOpen(false),
            }}
        >
            {children}
        </LangContext.Provider>
    );
}

export const useLang = () => {
    const ctx = useContext(LangContext);
    if (!ctx) throw new Error("useLang must be used within LangProvider");
    return ctx;
};

