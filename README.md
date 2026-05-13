# mvp-dbs-backend
## Cargar base de datos SQL

Endpoint:

POST `/professor/databases/upload`

Formato:

* multipart/form-data

Campo esperado:

* file

Formatos soportados:

* `.sql`
* `.tar`
* `.backup`

Ejemplo usando curl:

```bash
curl -X POST http://localhost:3000/professor/databases/upload \
-F "file=@test_exam_db.sql" \
-H "Authorization: Bearer TOKEN"
```

Respuesta exitosa:

```json
{
  "ok": true,
  "database": "db_12345",
  "message": "Database restored successfully"
}
```
