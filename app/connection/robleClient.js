// app/connection/robleClient.js
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

// Axios para manejar apropiadamente peticiones HTTP

export const robleClient = axios.create({
    baseURL: `${process.env.ROBLE_BASE_DB_URL}/${process.env.ROBLE_DB_NAME}`,
    headers: {
        Authorization: `Bearer ${process.env.ROBLE_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
    }
});
