<?php
$user = require_auth();
$database = db();
$resourceId = isset($_SERVER['ANIMORA_RESOURCE_ID']) ? (int) $_SERVER['ANIMORA_RESOURCE_ID'] : null;

if ($resourceId !== null) {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $statement = $database->prepare(
            'SELECT id, project_id, title, content, document_type, created_at, updated_at
             FROM documents WHERE id = :id AND user_id = :user_id'
        );
        $statement->execute(['id' => $resourceId, 'user_id' => $user['id']]);
        $document = $statement->fetch();
        if ($document === false) error_response('Document not found.', 404);
        json_response(['document' => $document]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
        $input = json_body();
        $title = array_key_exists('title', $input) ? required_string($input, 'title', 180) : null;
        $content = array_key_exists('content', $input) ? optional_string($input, 'content', 200000) : null;
        $documentType = array_key_exists('document_type', $input) ? required_string($input, 'document_type', 50) : null;
        $statement = $database->prepare(
            'UPDATE documents
             SET title = COALESCE(:title, title),
                 content = COALESCE(:content, content),
                 document_type = COALESCE(:document_type, document_type),
                 updated_at = NOW()
             WHERE id = :id AND user_id = :user_id
             RETURNING id, project_id, title, content, document_type, created_at, updated_at'
        );
        $statement->execute([
            'title' => $title,
            'content' => $content,
            'document_type' => $documentType,
            'id' => $resourceId,
            'user_id' => $user['id'],
        ]);
        $document = $statement->fetch();
        if ($document === false) error_response('Document not found.', 404);
        json_response(['document' => $document]);
    }

    require_method('DELETE');
    $statement = $database->prepare('DELETE FROM documents WHERE id = :id AND user_id = :user_id RETURNING id');
    $statement->execute(['id' => $resourceId, 'user_id' => $user['id']]);
    if (!$statement->fetch()) error_response('Document not found.', 404);
    json_response(['ok' => true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $statement = $database->prepare(
        'SELECT id, project_id, title, content, document_type, created_at, updated_at
         FROM documents WHERE user_id = :user_id ORDER BY updated_at DESC'
    );
    $statement->execute(['user_id' => $user['id']]);
    json_response(['documents' => $statement->fetchAll()]);
}

require_method('POST');
$input = json_body();
$title = required_string($input, 'title', 180);
$content = optional_string($input, 'content', 200000);
$documentType = optional_string($input, 'document_type', 50) ?: 'note';
$projectId = isset($input['project_id']) && ctype_digit((string) $input['project_id']) ? (int) $input['project_id'] : null;

if ($projectId !== null) {
    $projectCheck = $database->prepare('SELECT id FROM projects WHERE id = :id AND user_id = :user_id');
    $projectCheck->execute(['id' => $projectId, 'user_id' => $user['id']]);
    if (!$projectCheck->fetch()) {
        error_response('Project not found.', 404);
    }
}

$statement = $database->prepare(
    'INSERT INTO documents (project_id, user_id, title, content, document_type)
     VALUES (:project_id, :user_id, :title, :content, :document_type)
     RETURNING id, project_id, title, content, document_type, created_at, updated_at'
);
$statement->execute([
    'project_id' => $projectId,
    'user_id' => $user['id'],
    'title' => $title,
    'content' => $content,
    'document_type' => $documentType,
]);

json_response(['document' => $statement->fetch()], 201);