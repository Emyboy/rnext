import fs from 'fs/promises';
import path from 'path';

export const createCMSDirectory = async (directory: string) => {
    try {
        const directoryExists = await fs.access(directory).then(() => true).catch(() => false);

        if (!directoryExists) {
            await fs.mkdir(directory, { recursive: true });
            console.log(`📂 Created main directory`);
        }

        const collectionsDir = path.join(directory, 'collections');
        const configDir = path.join(directory, 'config');

        const collectionsExists = await fs.access(collectionsDir).then(() => true).catch(() => false);
        if (!collectionsExists) {
            await fs.mkdir(collectionsDir);
            console.log(`📂 Created collections directory`);
        }

        const configExists = await fs.access(configDir).then(() => true).catch(() => false);
        if (!configExists) {
            await fs.mkdir(configDir);
            console.log(`📂 Created config directory`);
        }

    } catch (error) {
        console.error('Error while validating CMS configuration:', error);
        throw new Error('Failed to initialize CMS configuration');
    }
}