import { useState } from 'react'

export default function PredictForm() {
    const [inputs, setInputs] = useState({})
    const [result, setResult] = useState(null)

    const handleSubmit = async (modelType) => {
        const endpoint = modelType === 'climate'
            ? '/api/climate/predict'
            : '/api/growth/predict'

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inputs)
            })
            setResult(await res.json())
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div>
            <h2>{modelType === 'climate' ? '气候因子预测' : '生长指标预测'}</h2>

            {modelType === 'climate' ? (
                <div>
                    <input type="number" placeholder="bio1"
                        onChange={(e) => setInputs({ ...inputs, bio1: e.target.value })} />
                    {/* 其他气候因子输入... */}
                </div>
            ) : (
                <div>
                    <input type="number" placeholder="根长(cm)"
                        onChange={(e) => setInputs({ ...inputs, root_length: e.target.value })} />
                    {/* 其他生长指标输入... */}
                </div>
            )}

            <button onClick={() => handleSubmit(modelType)}>预测</button>

            {result && (
                <div className="result">
                    <h3>预测结果</h3>
                    <p>种子编号: {result.seed_id}</p>
                    <p>可信度: {(result.confidence * 100).toFixed(2)}%</p>
                </div>
            )}
        </div>
    )
}
