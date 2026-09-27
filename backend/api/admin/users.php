<?php
require_admin();
require_method('GET');

$statement = db()->query(
    'SELECT id, name, email, role, created_at, updated_at
     FROM users ORDER BY created_at DESC'
);
json_response(['users' => $statement->fetchAll()]);