<?php
declare(strict_types=1);

require_once __DIR__ . '/../api/helpers.php';

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$basePath = rtrim(env_value('BASE_PATH', '/animora-api') ?? '/animora-api', '/');
if ($basePath !== '' && str_starts_with($path, $basePath)) {
    $path = substr($path, strlen($basePath)) ?: '/';
}
$path = '/' . trim($path, '/');
if ($path === '//') {
    $path = '/';
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
];
if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
}

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$routes = [
    'POST /auth/register' => __DIR__ . '/../api/auth/register.php',
    'POST /auth/login' => __DIR__ . '/../api/auth/login.php',
    'POST /auth/logout' => __DIR__ . '/../api/auth/logout.php',
    'GET /auth/me' => __DIR__ . '/../api/auth/me.php',
    'GET /courses' => __DIR__ . '/../api/content/courses.php',
    'GET /tutorials' => __DIR__ . '/../api/content/tutorials.php',
    'GET /problems' => __DIR__ . '/../api/content/problems.php',
    'GET /projects' => __DIR__ . '/../api/content/projects.php',
    'POST /projects' => __DIR__ . '/../api/content/projects.php',
    'GET /projects/:id' => __DIR__ . '/../api/content/projects.php',
    'PATCH /projects/:id' => __DIR__ . '/../api/content/projects.php',
    'DELETE /projects/:id' => __DIR__ . '/../api/content/projects.php',
    'GET /documents' => __DIR__ . '/../api/content/documents.php',
    'POST /documents' => __DIR__ . '/../api/content/documents.php',
    'GET /documents/:id' => __DIR__ . '/../api/content/documents.php',
    'PATCH /documents/:id' => __DIR__ . '/../api/content/documents.php',
    'DELETE /documents/:id' => __DIR__ . '/../api/content/documents.php',
    'GET /library' => __DIR__ . '/../api/content/library.php',
    'GET /queries' => __DIR__ . '/../api/content/queries.php',
    'POST /queries' => __DIR__ . '/../api/content/queries.php',
    'GET /objects' => __DIR__ . '/../api/content/objects.php',
    'POST /objects' => __DIR__ . '/../api/content/objects.php',
    'POST /contact-messages' => __DIR__ . '/../api/contact/messages.php',
    'GET /admin/users' => __DIR__ . '/../api/admin/users.php',
    'GET /admin/dashboard' => __DIR__ . '/../api/admin/dashboard.php',
    'GET /admin/contact-messages' => __DIR__ . '/../api/admin/resources.php',
    'GET /admin/projects' => __DIR__ . '/../api/admin/resources.php',
    'GET /admin/documents' => __DIR__ . '/../api/admin/resources.php',
    'GET /admin/courses' => __DIR__ . '/../api/admin/resources.php',
    'GET /admin/tutorials' => __DIR__ . '/../api/admin/resources.php',
    'GET /admin/problems' => __DIR__ . '/../api/admin/resources.php',
];

$routeKey = $method . ' ' . $path;
$dynamicResource = null;
if (preg_match('#^/(projects|documents)/(\d+)$#', $path, $matches) && in_array($method, ['GET', 'PATCH', 'DELETE'], true)) {
    $routeKey = $method . ' /' . $matches[1] . '/:id';
    $dynamicResource = $matches[1];
    $_SERVER['ANIMORA_RESOURCE_ID'] = $matches[2];
}
if (!isset($routes[$routeKey])) {
    error_response('Endpoint not found.', 404);
}

try {
    $_SERVER['ANIMORA_PATH'] = $path;
    if ($dynamicResource !== null) {
        $_SERVER['ANIMORA_RESOURCE'] = $dynamicResource;
    }
    if (str_starts_with($path, '/admin/')) {
        $_SERVER['ANIMORA_ADMIN_RESOURCE'] = trim(substr($path, strlen('/admin/')), '/');
    }
    require $routes[$routeKey];
} catch (PDOException $exception) {
    error_log($exception->getMessage());
    error_response('A database error occurred.', 500);
} catch (Throwable $exception) {
    error_log($exception->getMessage());
    error_response('An unexpected server error occurred.', 500);
}