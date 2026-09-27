<?php
require_method('GET');

$statement = db()->query(
    'SELECT id, title, description, category, level, duration, created_at, updated_at
     FROM courses ORDER BY category, id'
);
json_response(['courses' => $statement->fetchAll()]);