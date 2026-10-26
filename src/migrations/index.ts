import * as migration_20261026_144841_initial from './20261026_144841_initial';

export const migrations = [
  {
    up: migration_20261026_144841_initial.up,
    down: migration_20261026_144841_initial.down,
    name: '20261026_144841_initial'
  },
];
