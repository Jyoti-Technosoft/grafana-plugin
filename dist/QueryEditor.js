"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryEditor = void 0;
const react_1 = __importStar(require("react"));
const ui_1 = require("@grafana/ui");
const toOptions = (values) => values.map((v) => ({ label: v, value: v }));
function QueryEditor({ datasource, query, onChange, onRunQuery }) {
    var _a, _b, _c, _d;
    const [targets, setTargets] = (0, react_1.useState)([]);
    const [captures, setCaptures] = (0, react_1.useState)([]);
    const [metrics, setMetrics] = (0, react_1.useState)([]);
    const target = (_a = query.target) !== null && _a !== void 0 ? _a : '';
    const capture = (_b = query.capture) !== null && _b !== void 0 ? _b : '';
    const metric = (_c = query.metric) !== null && _c !== void 0 ? _c : '';
    const measurement = (_d = query.measurement) !== null && _d !== void 0 ? _d : '';
    (0, react_1.useEffect)(() => {
        datasource.getTargets().then((items) => setTargets(toOptions(items)));
    }, [datasource]);
    (0, react_1.useEffect)(() => {
        if (!target) {
            setCaptures([]);
            return;
        }
        datasource.getCaptures(target).then((items) => setCaptures(toOptions(items)));
    }, [datasource, target]);
    (0, react_1.useEffect)(() => {
        if (!target || !capture) {
            setMetrics([]);
            return;
        }
        datasource.getMetrics(target, capture).then((items) => setMetrics(toOptions(items)));
    }, [datasource, target, capture]);
    const updateQuery = (next) => {
        onChange({ ...query, ...next });
        onRunQuery();
    };
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(ui_1.InlineField, { label: "Target", labelWidth: 14 },
            react_1.default.createElement(ui_1.Select, { options: targets, value: target ? { label: target, value: target } : null, onChange: (value) => { var _a; return updateQuery({ target: (_a = value === null || value === void 0 ? void 0 : value.value) !== null && _a !== void 0 ? _a : '', capture: '', metric: '' }); }, width: 28, placeholder: "Select target" })),
        react_1.default.createElement(ui_1.InlineField, { label: "Capture", labelWidth: 14 },
            react_1.default.createElement(ui_1.Select, { options: captures, value: capture ? { label: capture, value: capture } : null, onChange: (value) => { var _a; return updateQuery({ capture: (_a = value === null || value === void 0 ? void 0 : value.value) !== null && _a !== void 0 ? _a : '', metric: '' }); }, width: 28, placeholder: "Select capture" })),
        react_1.default.createElement(ui_1.InlineField, { label: "Metric", labelWidth: 14 },
            react_1.default.createElement(ui_1.Select, { options: metrics, value: metric ? { label: metric, value: metric } : null, onChange: (value) => { var _a; return updateQuery({ metric: (_a = value === null || value === void 0 ? void 0 : value.value) !== null && _a !== void 0 ? _a : '' }); }, width: 28, placeholder: "Select metric" })),
        react_1.default.createElement(ui_1.InlineField, { label: "Measurement", labelWidth: 14 },
            react_1.default.createElement(ui_1.Select, { options: [
                    { label: 'value', value: 'value' },
                    { label: 'avg', value: 'avg' },
                    { label: 'max', value: 'max' },
                    { label: 'min', value: 'min' },
                ], value: measurement ? { label: measurement, value: measurement } : null, onChange: (value) => { var _a; return updateQuery({ measurement: (_a = value === null || value === void 0 ? void 0 : value.value) !== null && _a !== void 0 ? _a : '' }); }, width: 28, placeholder: "Optional" })),
        react_1.default.createElement(ui_1.InlineField, { label: "Spike only", labelWidth: 14 },
            react_1.default.createElement(ui_1.InlineSwitch, { value: Boolean(query.spikeOnly), onChange: (event) => updateQuery({ spikeOnly: event.currentTarget.checked }) }))));
}
exports.QueryEditor = QueryEditor;
