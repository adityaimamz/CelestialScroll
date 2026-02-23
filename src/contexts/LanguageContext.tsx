import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '@/i18n/translations';

type LanguageFilter = Language;

interface LanguageContextType {
    language: Language;
    languageFilter: LanguageFilter;
    setLanguageFilter: (filter: LanguageFilter) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [languageFilter, setLanguageFilter] = useState<LanguageFilter>(() => {
        const saved = localStorage.getItem('languageFilter');
        if (saved === 'en' || saved === 'id') return saved as LanguageFilter;
        return 'en';
    });

    const language: Language = languageFilter;

    useEffect(() => {
        localStorage.setItem('languageFilter', languageFilter);
    }, [languageFilter]);

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, languageFilter, setLanguageFilter, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
