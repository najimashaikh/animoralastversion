<?php
declare(strict_types=1);

require_once __DIR__ . '/../database/connection.php';

start_secure_session();

function json_response(mixed $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function error_response(string $message, int $status = 400, array $details = []): never
{
    json_response(['error' => $message, ...$details], $status);
}

function require_method(string ...$methods): void
{
    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    if (!in_array($method, $methods, true)) {
        header('Allow: ' . implode(', ', $methods));
        error_response('Method not allowed.', 405);
    }
}

function json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        error_response('Request body must be valid JSON.', 400);
    }

    return $decoded;
}

function required_string(array $input, string $key, int $maxLength = 10000): string
{
    $value = trim((string) ($input[$key] ?? ''));
    if ($value === '') {
        error_response(sprintf('%s is required.', ucfirst($key)), 422);
    }
    if (mb_strlen($value) > $maxLength) {
        error_response(sprintf('%s is too long.', ucfirst($key)), 422);
    }
    return $value;
}

function optional_string(array $input, string $key, int $maxLength = 10000): string
{
    $value = trim((string) ($input[$key] ?? ''));
    if (mb_strlen($value) > $maxLength) {
        error_response(sprintf('%s is too long.', ucfirst($key)), 422);
    }
    return $value;
}

function valid_email(string $email): string
{
    $email = trim(strtolower($email));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 255) {
        error_response('Enter a valid email address.', 422);
    }
    return $email;
}

function public_user(array $user): array
{
    return [
        'id' => (int) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'created_at' => $user['created_at'] ?? null,
        'updated_at' => $user['updated_at'] ?? null,
    ];
}

function current_user(): ?array
{
    $userId = $_SESSION['user_id'] ?? null;
    if (!is_int($userId) && !ctype_digit((string) $userId)) {
        return null;
    }

    $statement = db()->prepare('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = :id');
    $statement->execute(['id' => (int) $userId]);
    $user = $statement->fetch();
    return $user === false ? null : public_user($user);
}

function require_auth(): array
{
    $user = current_user();
    if ($user === null) {
        error_response('Authentication required.', 401);
    }
    return $user;
}

function require_admin(): array
{
    $user = require_auth();
    if ($user['role'] !== 'admin') {
        error_response('Admin access required.', 403);
    }
    return $user;
}

function id_from_path(string $path): int
{
    if (!preg_match('/^\d+$/', $path)) {
        error_response('Invalid resource id.', 422);
    }
    return (int) $path;
}