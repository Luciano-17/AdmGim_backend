import conectarDB from './config/db.js';

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import profesorRoutes from './routes/profesorRoutes.js';

const app = express();
app.use(express.json());

dotenv.config();

conectarDB();

const dominiosPermitidos = [process.env.FRONTEND_URL];
const corsOptions = {
    origin: function(origin, callback) {
        if(dominiosPermitidos.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    }
}
app.use(cors(corsOptions));

// Routes
app.use('/api/profesor', profesorRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Servidor funcionando ${PORT}`);
})