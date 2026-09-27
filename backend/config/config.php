<?php
declare(strict_types=1);

date_default_timezone_set('UTC');

function load_env_file(): void
{
    static $loaded = false;
    if ($loaded) {
        return;
    }
    $loaded = true;

    $candidates = [
        dirname(__DIR__, 2) . '/.env',
        dirname(__DIR__) . '/.env',
    ];

    foreach ($candidates as $filePath) {
        if (!file_exists($filePath) || !is_readable($filePath)) {
            continue;
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            continue;
        }

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            $parts = explode('=', $line, 2);
            if (count($parts) !== 2) {
                continue;
            }

            $key = trim($parts[0]);
            $val = trim($parts[1]);

            if (
                (str_starts_with($val, '"') && str_ends_with($val, '"')) ||
                (str_starts_with($val, "'") && str_ends_with($val, "'"))
            ) {
                $val = substr($val, 1, -1);
            }

            if (!array_key_exists($key, $_SERVER) && !array_key_exists($key, $_ENV) && getenv($key) === false) {
                putenv("{$key}={$val}");
                $_ENV[$key] = $val;
                $_SERVER[$key] = $val;
            }
        }
        break;
    }
}

load_env_file();

function env_value(string $key, ?string $fallback = null): ?string
{
    $value = getenv($key);
    return $value === false || $value === '' ? $fallback : $value;
}

function database_config(): array
{
    $databaseUrl = env_value('DATABASE_URL');
    if ($databaseUrl !== null) {
        $parsed = parse_url($databaseUrl);
        if ($parsed === false) {
            throw new RuntimeException('DATABASE_URL is invalid.');
        }

        parse_str($parsed['query'] ?? '', $query);

        return [
            'host' => $parsed['host'] ?? env_value('PGHOST', 'localhost'),
            'port' => (int) ($parsed['port'] ?? env_value('PGPORT', '5432')),
            'database' => ltrim((string) ($parsed['path'] ?? env_value('PGDATABASE', '')), '/'),
            'username' => $parsed['user'] ?? env_value('PGUSER', ''),
            'password' => $parsed['pass'] ?? env_value('PGPASSWORD', ''),
            'sslmode' => $query['sslmode'] ?? env_value('PGSSLMODE', 'prefer'),
        ];
    }

    return [
        'host' => env_value('PGHOST', 'localhost'),
        'port' => (int) env_value('PGPORT', '5432'),
        'database' => env_value('PGDATABASE', ''),
        'username' => env_value('PGUSER', ''),
        'password' => env_value('PGPASSWORD', ''),
        'sslmode' => env_value('PGSSLMODE', 'prefer'),
    ];
}

function start_secure_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_name('animora_session');

    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    session_start();
}