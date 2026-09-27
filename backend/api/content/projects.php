<?php
$user = require_auth();
$database = db();
$resourceId = isset($_SERVER['ANIMORA_RESOURCE_ID']) ? (int) $_SERVER['ANIMORA_RESOURCE_ID'] : null;

if ($resourceId !== null) {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $statement = $database->prepare(
            'SELECT id, title, description, status, created_at, updated_at
             FROM projects WHERE id = :id AND user_id = :user_id'
        );
        $statement->execute(['id' => $resourceId, 'user_id' => $user['id']]);
        $project = $statement->fetch();
        if ($project === false) error_response('Project not found.', 404);
        json_response(['project' => $project]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
        $input = json_body();
        $title = array_key_exists('title', $input) ? required_string($input, 'title', 180) : null;
        $description = array_key_exists('description', $input) ? optional_string($input, 'description', 10000) : null;
        $status = array_key_exists('status', $input) ? required_string($input, 'status', 30) : null;
        $statement = $database->prepare(
            'UPDATE projects
             SET title = COALESCE(:title, title),
                 description = COALESCE(:description, description),
                 status = COALESCE(:status, status),
                 updated_at = NOW()
             WHERE id = :id AND user_id = :user_id
             RETURNING id, title, description, status, created_at, updated_at'
        );
        $statement->execute([
            'title' => $title,
            'description' => $description,
            'status' => $status,
            'id' => $resourceId,
            'user_id' => $user['id'],
        ]);
        $project = $statement->fetch();
        if ($project === false) error_response('Project not found.', 404);
        json_response(['project' => $project]);
    }

    require_method('DELETE');
    $statement = $database->prepare('DELETE FROM projects WHERE id = :id AND user_id = :user_id RETURNING id');
    $statement->execute(['id' => $resourceId, 'user_id' => $user['id']]);
    if (!$statement->fetch()) error_response('Project not found.', 404);
    json_response(['ok' => true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $statement = $database->prepare(
        'SELECT id, title, description, status, created_at, updated_at
         FROM projects WHERE user_id = :user_id ORDER BY updated_at DESC'
    );
    $statement->execute(['user_id' => $user['id']]);
    json_response(['projects' => $statement->fetchAll()]);
}

require_method('POST');
$input = json_body();
$title = required_string($input, 'title', 180);
$description = optional_string($input, 'description', 10000);
$status = optional_string($input, 'status', 30) ?: 'draft';

$statement = $database->prepare(
    'INSERT INTO projects (user_id, title, description, status)
     VALUES (:user_id, :title, :description, :status)
     RETURNING id, title, description, status, created_at, updated_at'
);
$statement->execute([
    'user_id' => $user['id'],
    'title' => $title,
    'description' => $description,
    'status' => $status,
]);

json_response(['project' => $statement->fetch()], 201);