import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { CheckIcon } from '@heroicons/react/20/solid';

import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function Hero() {
    const { t } = useTranslation();

    // 雷达图相关状态
    const [modelMetrics, setModelMetrics] = useState([]);
    const [predictions, setPredictions] = useState({});

    const [astragalusData, setAstragalusData] = useState({
        root_length: '',
        yield: '',
        c7g_content: ''
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
        const fetchMetrics = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/astragalus/model-metrics');
                console.log(response)
                setModelMetrics(response.data.metrics);
            } catch (error) {
                console.error('获取模型指标失败:', error);
            }
        };
        fetchMetrics();

    }, []);

    const handleAstragalusSubmit = async (e) => {
        e.preventDefault();
        try {
            // 对每个模型都进行预测
            const modelResults = {};
            for (const model of ["XGBoost", "RandomForest", "KNN", "ANN"]) {
                const response = await axios.post('http://localhost:5000/api/astragalus/predict', {
                    ...astragalusData,
                    model_name: model
                });
                modelResults[model] = response.data;
            }
            setPredictions(modelResults);
            // 设置最佳预测结果
            const bestPrediction = Object.entries(modelResults)
                .reduce((best, [model, result]) =>
                    result.confidence > best.confidence ? result : best,
                    { confidence: -1 }
                );
            setAstragalusResult(bestPrediction);
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

    const renderPredictionResults = () => {
        if (!predictions || Object.keys(predictions).length === 0) return null;

        const radarData = modelMetrics.map(metric => ({
            subject: metric.Model,
            '训练准确率': Math.max(metric.Train_R2_mean * 100, 0),
            '测试准确率': Math.max(metric.Test_R2_mean * 100, 0)
        }));

        return (
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    {t('model_comparison')}
                </h3>

                {/* 雷达图 */}
                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar
                                name="训练准确率"
                                dataKey="训练准确率"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.6}
                            />
                            <Radar
                                name="测试准确率"
                                dataKey="测试准确率"
                                stroke="#82ca9d"
                                fill="#82ca9d"
                                fillOpacity={0.6}
                            />
                            <Legend />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* 预测结果列表 */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                    {Object.entries(predictions).map(([model, result]) => (
                        <div key={model}
                            className={`p-4 rounded-lg ${result === astragalusResult
                                ? 'bg-blue-50 border-2 border-blue-200'
                                : 'bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">{model}</span>
                                {result === astragalusResult && (
                                    <CheckIcon className="h-5 w-5 text-blue-600" />
                                )}
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                                <div>预测结果: {result.source_id}</div>
                                <div>置信度: {(result.confidence * 100).toFixed(2)}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
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

                        {/* 添加预测结果和雷达图 */}
                        {renderPredictionResults()}

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
