<?php
require_method('GET');

$statement = db()->query(
    'SELECT id, slug, title, description, category, resource_type AS "resourceType",
            resource_url AS "resourceUrl", thumbnail, created_at
     FROM library ORDER BY created_at DESC, id DESC'
);
json_response(['library' => $statement->fetchAll()]);