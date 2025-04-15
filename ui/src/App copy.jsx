import React, { useState } from 'react';
import axios from 'axios';

export default function App() {
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

    const handleAstragalusSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/astragalus/predict', astragalusData);
            setAstragalusResult(response.data);
        } catch (error) {
            console.error(error);
            alert('预测失败，请检查输入数据');
        }
    };

    const handleClimateSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/climate/predict', climateData);
            setClimateResult(response.data);
        } catch (error) {
            console.error(error);
            alert('预测失败，请检查输入数据');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        药植智境模型
                    </h1>
                    <p className="mt-3 text-xl text-gray-500">
                        输入参数获取黄芪生长和气候预测结果
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Astragalus 表单 */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            <span className="text-blue-600">黄芪</span> 生长预测
                        </h2>
                        <form onSubmit={handleAstragalusSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="root_length" className="block text-sm font-medium text-gray-700 mb-1">
                                        根长 (cm)
                                    </label>
                                    <input
                                        type="number"
                                        id="root_length"
                                        name="root_length"
                                        placeholder="请输入根长"
                                        value={astragalusData.root_length}
                                        onChange={handleAstragalusChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="yield" className="block text-sm font-medium text-gray-700 mb-1">
                                        产量 (kg/mu)
                                    </label>
                                    <input
                                        type="number"
                                        id="yield"
                                        name="yield"
                                        placeholder="请输入产量"
                                        value={astragalusData.yield}
                                        onChange={handleAstragalusChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="c7g_content" className="block text-sm font-medium text-gray-700 mb-1">
                                        C7G 含量 (%)
                                    </label>
                                    <input
                                        type="number"
                                        id="c7g_content"
                                        name="c7g_content"
                                        placeholder="请输入C7G含量"
                                        value={astragalusData.c7g_content}
                                        onChange={handleAstragalusChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    提交预测
                                </button>
                            </div>
                        </form>
                        {astragalusResult && (
                            <div className="mt-6 p-4 bg-blue-50 rounded-md">
                                <h3 className="text-lg font-medium text-blue-800 mb-2">预测结果</h3>
                                <div className="bg-white p-3 rounded text-sm font-mono overflow-x-auto">
                                    <pre>{JSON.stringify(astragalusResult, null, 2)}</pre>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Climate 表单 */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            <span className="text-green-600">气候</span> 预测
                        </h2>
                        <form onSubmit={handleClimateSubmit}>
                            <div className="space-y-4">
                                {['bio1', 'bio2', 'bio3', 'bio4', 'bio5'].map((feature) => (
                                    <div key={feature}>
                                        <label htmlFor={feature} className="block text-sm font-medium text-gray-700 mb-1">
                                            {feature.toUpperCase()} 值
                                        </label>
                                        <input
                                            type="number"
                                            id={feature}
                                            name={feature}
                                            placeholder={`请输入${feature}值`}
                                            value={climateData[feature] || ''}
                                            onChange={handleClimateChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                            required
                                        />
                                    </div>
                                ))}
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    提交预测
                                </button>
                            </div>
                        </form>
                        {climateResult && (
                            <div className="mt-6 p-4 bg-green-50 rounded-md">
                                <h3 className="text-lg font-medium text-green-800 mb-2">预测结果</h3>
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
