"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = void 0;
const data_1 = require("@grafana/data");
const datasource_1 = require("./datasource");
const ConfigEditor_1 = require("./ConfigEditor");
const QueryEditor_1 = require("./QueryEditor");
exports.plugin = new data_1.DataSourcePlugin(datasource_1.HlcDataSource)
    .setConfigEditor(ConfigEditor_1.ConfigEditor)
    .setQueryEditor(QueryEditor_1.QueryEditor);
