import { join } from 'path';
import { deserializeJsonPayload, fluvial } from 'fluvial';
import { addGlobalRoutes } from './routers/index.js';

const app = fluvial({
    ssl: {
        certificatePath: join(process.cwd(), '.cert', 'cert.pem'),
        keyPath: join(process.cwd(), '.cert', 'key.pem'),
    },
});

app.use(deserializeJsonPayload());
addGlobalRoutes(app);

app.listen(4040, () => {
    console.log('fluvial sample up and running at port 4040');
});
