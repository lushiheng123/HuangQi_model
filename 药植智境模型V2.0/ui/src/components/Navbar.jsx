import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
    const { t, i18n } = useTranslation();

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
                    <div className="flex items-center">
                        <button
                            onClick={() => i18n.changeLanguage('zh')}
                            className={`px-4 py-2 mr-2 rounded-md ${i18n.language === 'zh' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            中文
                        </button>
                        <button
                            onClick={() => i18n.changeLanguage('en')}
                            className={`px-4 py-2 rounded-md ${i18n.language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            English
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}