import { DataSourcePlugin } from '@grafana/data';
import { HlcDataSource } from './datasource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import type { HlcDataSourceOptions, HlcQuery } from './types';

export const plugin = new DataSourcePlugin<HlcDataSource, HlcQuery, HlcDataSourceOptions>(HlcDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
