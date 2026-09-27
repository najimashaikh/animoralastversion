<?php
require_method('GET');

$statement = db()->query(
    'SELECT id, title, description, category, duration, video_url AS "videoUrl", thumbnail, created_at, updated_at
     FROM tutorials ORDER BY category, id'
);
json_response(['tutorials' => $statement->fetchAll()]);