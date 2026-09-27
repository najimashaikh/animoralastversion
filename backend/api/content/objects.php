<?php
$user = require_auth();
$database = db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $statement = $database->prepare(
        'SELECT id, project_id, name, object_type, metadata, created_at
         FROM objects WHERE user_id = :user_id ORDER BY created_at DESC'
    );
    $statement->execute(['user_id' => $user['id']]);
    json_response(['objects' => $statement->fetchAll()]);
}

require_method('POST');
$input = json_body();
$name = required_string($input, 'name', 180);
$objectType = optional_string($input, 'object_type', 80) ?: 'asset';
$metadata = $input['metadata'] ?? [];
if (!is_array($metadata)) {
    error_response('Metadata must be an object.', 422);
}
$projectId = isset($input['project_id']) && ctype_digit((string) $input['project_id']) ? (int) $input['project_id'] : null;

if ($projectId !== null) {
    $projectCheck = $database->prepare('SELECT id FROM projects WHERE id = :id AND user_id = :user_id');
    $projectCheck->execute(['id' => $projectId, 'user_id' => $user['id']]);
    if (!$projectCheck->fetch()) {
        error_response('Project not found.', 404);
    }
}

$statement = $database->prepare(
    'INSERT INTO objects (user_id, project_id, name, object_type, metadata)
     VALUES (:user_id, :project_id, :name, :object_type, CAST(:metadata AS jsonb))
     RETURNING id, project_id, name, object_type, metadata, created_at'
);
$statement->execute([
    'user_id' => $user['id'],
    'project_id' => $projectId,
    'name' => $name,
    'object_type' => $objectType,
    'metadata' => json_encode($metadata, JSON_UNESCAPED_SLASHES),
]);
json_response(['object' => $statement->fetch()], 201);