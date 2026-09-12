import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
const LanguageContext = createContext({
    lang: 'en',
    setLang: () => { },
});
export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        const saved = localStorage.getItem('suraksha-lang');
        return saved || 'en';
    });
    useEffect(() => {
        localStorage.setItem('suraksha-lang', lang);
    }, [lang]);
    return (_jsx(LanguageContext.Provider, { value: { lang, setLang }, children: children }));
}
export function useLanguage() {
    return useContext(LanguageContext);
}
