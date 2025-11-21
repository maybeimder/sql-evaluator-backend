// app/database/initTables.js
import schematics from "./tablesSchematic.js"
import { robleClient } from "../connection/robleClient.js";

export default async function initTables() {

    // Por cada schematic crear una tabla
    for ( const schematic of Object.keys(schematics) ) {
        await createTable(schematics[schematic])
    }

    console.log('Finished setting up tables');
}

async function createTable(body) {

    /* 
        Funcion reutilizable para llamar al endpoint y 
        crear la tabla basado en el schematic recibido
    */  
   
    try {
        const res = await robleClient.post('/create-table', body);
        console.log(`${body.tableName}: ` , res.status)
    } catch (e) {
        console.error(e)
    }
}



