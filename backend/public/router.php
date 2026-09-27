<?php
declare(strict_types=1);

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

// 1. API routes go straight to backend index.php
if (str_starts_with($uri, '/animora-api')) {
    require __DIR__ . '/index.php';
    exit;
}

// 2. Static frontend files (Production SPA routing)
$frontendDist = realpath(__DIR__ . '/../../artifacts/animora-studio-library/dist/public');
if ($frontendDist !== false) {
    $requestedPath = realpath($frontendDist . $uri);

    // If an exact static file exists (CSS, JS, images), serve it with appropriate MIME
    if ($requestedPath !== false && str_starts_with($requestedPath, $frontendDist) && is_file($requestedPath)) {
        $ext = strtolower(pathinfo($requestedPath, PATHINFO_EXTENSION));
        $mimes = [
            'css'   => 'text/css; charset=utf-8',
            'js'    => 'application/javascript; charset=utf-8',
            'mjs'   => 'application/javascript; charset=utf-8',
            'json'  => 'application/json; charset=utf-8',
            'png'   => 'image/png',
            'jpg'   => 'image/jpeg',
            'jpeg'  => 'image/jpeg',
            'svg'   => 'image/svg+xml',
            'ico'   => 'image/x-icon',
            'webp'  => 'image/webp',
            'woff'  => 'font/woff',
            'woff2' => 'font/woff2',
            'ttf'   => 'font/ttf',
        ];
        if (isset($mimes[$ext])) {
            header('Content-Type: ' . $mimes[$ext]);
        }
        readfile($requestedPath);
        exit;
    }

    // SPA fallback: return index.html for all UI routes
    $indexHtml = $frontendDist . DIRECTORY_SEPARATOR . 'index.html';
    if (file_exists($indexHtml)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($indexHtml);
        exit;
    }
}

// Default fallback to index.php
require __DIR__ . '/index.php';