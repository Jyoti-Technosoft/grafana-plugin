"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HlcDataSource = void 0;
const runtime_1 = require("@grafana/runtime");
class HlcDataSource extends runtime_1.DataSourceWithBackend {
    constructor(instanceSettings) {
        super(instanceSettings);
    }
    async metricFindQuery(queryText) {
        const query = queryText.trim().toLowerCase();
        const values = await this.fetchVariableValues(query === 'metrics' ? 'metrics' : 'targets', {});
        return values.map((text) => ({ text }));
    }
    async getTargets() {
        return this.fetchVariableValues('targets', {});
    }
    async getCaptures(targetName) {
        return this.fetchVariableValues('captures', { targetName });
    }
    async getMetrics(targetName, captureName) {
        return this.fetchVariableValues('metrics', { targetName, captureName });
    }
    async getMeasurements(targetName, captureName, metricName) {
        return this.fetchVariableValues('measurements', { targetName, captureName, metricName });
    }
    async fetchVariableValues(variable, body) {
        const response = (await (0, runtime_1.getBackendSrv)().post(`/api/datasources/uid/${this.uid}/resources/variables/${variable}`, body));
        return Array.isArray(response) ? response : [];
    }
}
exports.HlcDataSource = HlcDataSource;
