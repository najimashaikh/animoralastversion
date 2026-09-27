<?php
require_method('POST');

$input = json_body();
$name = required_string($input, 'name', 120);
$email = valid_email(required_string($input, 'email', 255));
$password = (string) ($input['password'] ?? '');

if (strlen($password) < 8 || strlen($password) > 200) {
    error_response('Password must be between 8 and 200 characters.', 422);
}

$database = db();
$existing = $database->prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1');
$existing->execute(['email' => $email]);
if ($existing->fetch()) {
    error_response('An account with that email already exists.', 409);
}

$statement = $database->prepare(
    'INSERT INTO users (name, email, password_hash, role) VALUES (:name, :email, :password_hash, :role)
     RETURNING id, name, email, role, created_at, updated_at'
);
$statement->execute([
    'name' => $name,
    'email' => $email,
    'password_hash' => password_hash($password, PASSWORD_DEFAULT),
    'role' => 'user',
]);

$user = $statement->fetch();
session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['id'];

json_response(['user' => public_user($user)], 201);