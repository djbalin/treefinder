import * as migration_20261026_144841_initial from './20261026_144841_initial';
import * as migration_20261026_145600_data_model from './20261026_145600_data_model';
import * as migration_20261026_151247_photo_pipeline from './20261026_151247_photo_pipeline';

export const migrations = [
  {
    up: migration_20261026_144841_initial.up,
    down: migration_20261026_144841_initial.down,
    name: '20261026_144841_initial',
  },
  {
    up: migration_20261026_145600_data_model.up,
    down: migration_20261026_145600_data_model.down,
    name: '20261026_145600_data_model',
  },
  {
    up: migration_20261026_151247_photo_pipeline.up,
    down: migration_20261026_151247_photo_pipeline.down,
    name: '20261026_151247_photo_pipeline'
  },
];
