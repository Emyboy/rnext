import { RNextApp } from './core';
import type { RNextConfig } from './types/app.types';

const config: RNextConfig = {
    dbName: 'myCMS',
    directory: './public',
    port: 1337,
    route: '/cms',
};

const rNextApp = new RNextApp(config);
rNextApp.start();
