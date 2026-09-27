<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/config.php';

function db(): PDO
{
    static $connection = null;
    if ($connection instanceof PDO) {
        return $connection;
    }

    $databaseUrl = env_value('DATABASE_URL');

    // 1. Try PostgreSQL if DATABASE_URL starts with postgresql:// or pgsql://
    if ($databaseUrl === null || !str_starts_with($databaseUrl, 'sqlite:')) {
        try {
            $config = database_config();
            if (!empty($config['database'])) {
                $dsn = sprintf(
                    'pgsql:host=%s;port=%d;dbname=%s;sslmode=%s',
                    $config['host'],
                    $config['port'],
                    $config['database'],
                    $config['sslmode'],
                );

                $connection = new PDO($dsn, $config['username'], $config['password'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);

                return $connection;
            }
        } catch (Throwable $e) {
            // PostgreSQL not reachable; seamlessly fallback to SQLite for zero-config local operation
            error_log('[Animora DB] PostgreSQL unavailable (' . $e->getMessage() . '). Falling back to self-contained SQLite.');
        }
    }

    // 2. Zero-config SQLite fallback (no setup, no passwords, guaranteed to work)
    $sqlitePath = __DIR__ . '/animora.sqlite';
    $isNewDb = !file_exists($sqlitePath) || filesize($sqlitePath) === 0;

    $connection = new PDO('sqlite:' . $sqlitePath, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // SQLite compatibility functions for PostgreSQL SQL compatibility
    $connection->sqliteCreateFunction('now', fn() => date('Y-m-d H:i:s'));
    $connection->sqliteCreateFunction('jsonb', fn($val) => $val);

    // Auto-initialize SQLite database if new
    if ($isNewDb) {
        $schemaFile = dirname(__DIR__, 2) . '/database/schema_sqlite.sql';
        if (file_exists($schemaFile)) {
            $connection->exec(file_get_contents($schemaFile));
        }
        // Auto-seed
        $seedFile = __DIR__ . '/seed.php';
        if (file_exists($seedFile)) {
            try {
                // Ensure seed uses this connection
                require_once $seedFile;
            } catch (Throwable $e) {
                error_log('[Animora DB] Seed error: ' . $e->getMessage());
            }
        }
    }

    return $connection;
}