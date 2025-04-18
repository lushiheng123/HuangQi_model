import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

export default function Hero() {
    const { t, i18n } = useTranslation();
    const [selectedModel, setSelectedModel] = useState(null);
    const [availableModels, setAvailableModels] = useState([]);
    const [astragalusData, setAstragalusData] = useState({
        root_length: '',
        yield: '',
        c7g_content: '',
        model_name: 'XGBoost', // 默认模型
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

    // 获取可用模型列表
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/astragalus/models');
                setAvailableModels(response.data.models);
                setSelectedModel(response.data.default);
            } catch (error) {
                console.error('Failed to fetch models:', error);
            }
        };
        fetchModels();
    }, []);

    const handleAstragalusSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/astragalus/predict', {
                ...astragalusData,
                model_name: selectedModel
            });
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
    //新
    const fetchModelMetrics = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/astragalus/model-metrics');
            const { metrics } = response.data;
            // 处理数据用于图表展示
            const chartData = metrics.map(item => ({
                name: item.name,
                '训练集 R²': item.metrics.train.r2,
                '测试集 R²': item.metrics.test.r2
            }));
            // 在这里更新你的图表数据状态
        } catch (error) {
            console.error('获取模型指标失败:', error);
        }
    };
    return (
        <div className="min-h-screen bg-gray-50">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 左侧 - 流程图区域 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            <span className="text-purple-600">{t('process_flow')}</span>
                        </h2>
                        <div className="aspect-w-16 aspect-h-9">
                            {/* 这里放置流程图的占位区域 */}
                            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                                <p className="text-gray-500 text-center">
                                    {t('flow_chart_placeholder')}
                                    <br />
                                    <span className="text-sm">{t('flow_chart_description')}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 右侧 - 预测表单区域 */}
                    <div className="space-y-8">
                        {/* 原有的 Astragalus 表单 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                                <span className="text-blue-600">{t('astragalus_prediction')}</span>
                            </h2>

                            {/* 模型选择下拉菜单 */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('select_model')}
                                </label>
                                <Listbox value={selectedModel} onChange={setSelectedModel}>
                                    <div className="relative mt-1">
                                        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                            <span className="block truncate">{selectedModel}</span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <ChevronUpDownIcon
                                                    className="h-5 w-5 text-gray-400"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        </Listbox.Button>
                                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                            {availableModels.map((model) => (
                                                <Listbox.Option
                                                    key={model}
                                                    value={model}
                                                    className={({ active }) =>
                                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                                        }`
                                                    }
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                                {model}
                                                            </span>
                                                            {selected ? (
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </div>
                                </Listbox>
                            </div>

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
                                    <h3 className="text-lg font-medium text-blue-800 mb-2">
                                        {t('prediction_result')} ({astragalusResult.model_used})
                                    </h3>
                                    <div className="bg-white p-3 rounded text-sm font-mono overflow-x-auto">
                                        <pre>{JSON.stringify(astragalusResult, null, 2)}</pre>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 原有的 Climate 表单 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
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
        </div>
    );
}
