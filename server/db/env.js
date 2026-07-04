// Loads the repo-root .env exactly once, from wherever the server is started.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
