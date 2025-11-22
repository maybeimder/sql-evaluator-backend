// app/database/initTables.ts
import schematics from "./tablesSchematic.json"; 
import { robleClient } from "../connection/robleClient";

export default async function initTables() {

    // Por cada schematic crear una tabla
    for ( const key of Object.keys(schematics) ) {
        await createTable(schematics[key as keyof typeof schematics])
    }

    console.log('Finished setting up tables');
}

async function createTable( body : any ) {

    /* 
        Funcion reutilizable para llamar al endpoint y 
        crear la tabla basado en el schematic recibido
    */  
   
    try {
        const res = await robleClient().post('/create-table', body);
        console.log(`${body.tableName}: ` , res.status)
    } catch (e) {
        console.error(e)
    }
}



