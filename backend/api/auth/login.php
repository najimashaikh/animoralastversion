<?php
require_method('POST');

$input = json_body();
$email = valid_email(required_string($input, 'email', 255));
$password = (string) ($input['password'] ?? '');

if ($password === '') {
    error_response('Password is required.', 422);
}

$statement = db()->prepare('SELECT id, name, email, password_hash, role, created_at, updated_at FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1');
$statement->execute(['email' => $email]);
$user = $statement->fetch();

if ($user === false || !password_verify($password, $user['password_hash'])) {
    error_response('Incorrect email or password.', 401);
}

if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
    $rehash = db()->prepare('UPDATE users SET password_hash = :password_hash, updated_at = NOW() WHERE id = :id');
    $rehash->execute([
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'id' => $user['id'],
    ]);
}

session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['id'];

json_response(['user' => public_user($user)]);