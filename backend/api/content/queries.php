<?php
$user = require_auth();
$database = db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $statement = $database->prepare(
        'SELECT id, question, answer, status, created_at, updated_at
         FROM queries WHERE user_id = :user_id ORDER BY created_at DESC'
    );
    $statement->execute(['user_id' => $user['id']]);
    json_response(['queries' => $statement->fetchAll()]);
}

require_method('POST');
$input = json_body();
$question = required_string($input, 'question', 20000);
$statement = $database->prepare(
    'INSERT INTO queries (user_id, question) VALUES (:user_id, :question)
     RETURNING id, question, answer, status, created_at, updated_at'
);
$statement->execute(['user_id' => $user['id'], 'question' => $question]);
json_response(['query' => $statement->fetch()], 201);