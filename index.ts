import { RNextApp } from './core';
import type { RNextConfig } from './types/app.types';

const config: RNextConfig = {
    directory: './rnext',
    port: 1337,
    route: '/cms',
    dbConnection: `mongodb://localhost:27017/cms_app`,
};

async function startApp() {
    const rNextApp = new RNextApp(config);

    try {
        await rNextApp.initialize();
        await rNextApp.start();
        console.log('RNext CMS has started successfully');
    } catch (error) {
        console.error('Failed to start RNext CMS:', error);
        process.exit(1);
    }
}

startApp();