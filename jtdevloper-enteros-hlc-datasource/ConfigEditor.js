"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigEditor = void 0;
const react_1 = __importDefault(require("react"));
const ui_1 = require("@grafana/ui");
function ConfigEditor(props) {
    var _a, _b, _c;
    const { options, onOptionsChange } = props;
    const { jsonData, secureJsonData } = options;
    const onApiUrlChange = (event) => {
        onOptionsChange({
            ...options,
            jsonData: {
                ...jsonData,
                apiUrl: event.target.value,
            },
        });
    };
    const onTokenChange = (event) => {
        onOptionsChange({
            ...options,
            secureJsonData: {
                ...secureJsonData,
                apiToken: event.target.value,
            },
        });
    };
    const onResetToken = () => {
        onOptionsChange({
            ...options,
            secureJsonData: {
                ...secureJsonData,
                apiToken: '',
            },
        });
    };
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(ui_1.InlineField, { label: "HLC API URL", labelWidth: 20, tooltip: "Example: https://hlc.company.internal" },
            react_1.default.createElement(ui_1.Input, { width: 60, value: (_a = jsonData.apiUrl) !== null && _a !== void 0 ? _a : '', onChange: onApiUrlChange, placeholder: "https://hlc.example.internal" })),
        react_1.default.createElement(ui_1.InlineField, { label: "API Token", labelWidth: 20, tooltip: "Stored in secureJsonData; not exposed in browser requests." },
            react_1.default.createElement(ui_1.SecretInput, { width: 60, value: (_b = secureJsonData === null || secureJsonData === void 0 ? void 0 : secureJsonData.apiToken) !== null && _b !== void 0 ? _b : '', onChange: onTokenChange, isConfigured: Boolean((_c = options.secureJsonFields) === null || _c === void 0 ? void 0 : _c.apiToken), onReset: onResetToken, placeholder: "Bearer token value" }))));
}
exports.ConfigEditor = ConfigEditor;
