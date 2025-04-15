// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 翻译资源
const resources = {
    zh: {
        translation: {
            title: '药植智境模型',
            subtitle: '输入参数获取黄芪生长和气候预测结果',
            astragalus_prediction: '黄芪生长预测',
            climate_prediction: '气候预测',
            root_length: '根长 (cm)',
            yield: '产量 (kg/mu)',
            c7g_content: 'C7G 含量 (%)',
            submit_prediction: '提交预测',
            prediction_result: '预测结果',
            bio_label: '{{bio}} 值',
            validation_required: '请填写此字段'
        },
    },
    en: {
        translation: {
            title: 'Medicinal Plant Intelligence Model',
            subtitle: 'Enter parameters to get Astragalus growth and climate predictions',
            astragalus_prediction: 'Astragalus Growth Prediction',
            climate_prediction: 'Climate Prediction',
            root_length: 'Root Length (cm)',
            yield: 'Yield (kg/mu)',
            c7g_content: 'C7G Content (%)',
            submit_prediction: 'Submit Prediction',
            prediction_result: 'Prediction Result',
            bio_label: '{{bio}} Value',
            validation_required: 'Please fill out this field'
        },
    },
};

i18n
    .use(LanguageDetector) // 自动检测用户语言
    .use(initReactI18next) // 绑定 react-i18next
    .init({
        resources,
        fallbackLng: 'zh', // 默认语言
        interpolation: {
            escapeValue: false, // React 已经处理了 XSS
        },
    });

export default i18n;