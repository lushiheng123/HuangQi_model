import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function App() {
    const { t, i18n } = useTranslation();
    const [astragalusData, setAstragalusData] = useState({
        root_length: '',
        yield: '',
        c7g_content: '',
    });
    const [climateData, setClimateData] = useState({});
    const [astragalusResult, setAstragalusResult] = useState(null);
    const [climateResult, setClimateResult] = useState(null);

    const handleAstragalusChange = (e) => {
        setAstragalusData({ ...astragalusData, [e.target.name]: e.target.value });
    };

    const handleClimateChange = (e) => {
        setClimateData({ ...climateData, [e.target.name]: e.target.value });
    };

    // 自定义验证消息（当验证失败时触发）
    const setCustomValidityMessage = (e) => {
        if (e.target.validity.valueMissing) {
            e.target.setCustomValidity(t('validation_required'));
        }
    };

    // 清除自定义验证消息（当用户输入时）
    const clearCustomValidity = (e) => {
        e.target.setCustomValidity('');
    };

    const handleAstragalusSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/astragalus/predict', astragalusData);
            setAstragalusResult(response.data);
        } catch (error) {
            console.error(error);
            alert(t('prediction_failed'));
        }
    };

    const handleClimateSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/climate/predict', climateData);
            setClimateResult(response.data);
        } catch (error) {
            console.error(error);
            alert(t('prediction_failed'));
            
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* 语言切换控件 */}
                <div className="flex justify-end mb-4">
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

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        {t('title')}
                    </h1>
                    <p className="mt-3 text-xl text-gray-500">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Astragalus 表单 */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            <span className="text-blue-600">{t('astragalus_prediction')}</span>
                        </h2>
                        <form onSubmit={handleAstragalusSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="root_length" className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('root_length')}
                                    </label>
                                    <input
                                        type="number"
                                        id="root_length"
                                        name="root_length"
                                        placeholder={t('root_length')}
                                        value={astragalusData.root_length}
                                        onChange={handleAstragalusChange}
                                        onInvalid={setCustomValidityMessage}
                                        onInput={clearCustomValidity}
                                        title={t('validation_required')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="yield" className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('yield')}
                                    </label>
                                    <input
                                        type="number"
                                        id="yield"
                                        name="yield"
                                        placeholder={t('yield')}
                                        value={astragalusData.yield}
                                        onChange={handleAstragalusChange}
                                        onInvalid={setCustomValidityMessage}
                                        onInput={clearCustomValidity}
                                        title={t('validation_required')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="c7g_content" className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('c7g_content')}
                                    </label>
                                    <input
                                        type="number"
                                        id="c7g_content"
                                        name="c7g_content"
                                        placeholder={t('c7g_content')}
                                        value={astragalusData.c7g_content}
                                        onChange={handleAstragalusChange}
                                        onInvalid={setCustomValidityMessage}
                                        onInput={clearCustomValidity}
                                        title={t('validation_required')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {t('submit_prediction')}
                                </button>
                            </div>
                        </form>
                        {astragalusResult && (
                            <div className="mt-6 p-4 bg-blue-50 rounded-md">
                                <h3 className="text-lg font-medium text-blue-800 mb-2">{t('prediction_result')}</h3>
                                <div className="bg-white p-3 rounded text-sm font-mono overflow-x-auto">
                                    <pre>{JSON.stringify(astragalusResult, null, 2)}</pre>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Climate 表单 */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            <span className="text-green-600">{t('climate_prediction')}</span>
                        </h2>
                        <form onSubmit={handleClimateSubmit}>
                            <div className="space-y-4">
                                {['bio1', 'bio2', 'bio3', 'bio4', 'bio5'].map((feature) => (
                                    <div key={feature}>
                                        <label htmlFor={feature} className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('bio_label', { bio: feature.toUpperCase() })}
                                        </label>
                                        <input
                                            type="number"
                                            id={feature}
                                            name={feature}
                                            placeholder={t('bio_label', { bio: feature.toUpperCase() })}
                                            value={climateData[feature] || ''}
                                            onChange={handleClimateChange}
                                            onInvalid={setCustomValidityMessage}
                                            onInput={clearCustomValidity}
                                            title={t('validation_required')}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                            required
                                        />
                                    </div>
                                ))}
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    {t('submit_prediction')}
                                </button>
                            </div>
                        </form>
                        {climateResult && (
                            <div className="mt-6 p-4 bg-green-50 rounded-md">
                                <h3 className="text-lg font-medium text-green-800 mb-2">{t('prediction_result')}</h3>
                                <div className="bg-white p-3 rounded text-sm font-mono overflow-x-auto">
                                    <pre>{JSON.stringify(climateResult, null, 2)}</pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
