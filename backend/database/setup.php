<?php
declare(strict_types=1);

require_once __DIR__ . '/connection.php';

echo "=========================================\n";
echo " Animora Database Setup & Migration Script\n";
echo "=========================================\n\n";

try {
    $database = db();
    echo "[1/3] Connected to PostgreSQL successfully.\n";

    // 1. Run schema.sql
    $schemaPath = dirname(__DIR__, 2) . '/database/schema.sql';
    if (!file_exists($schemaPath)) {
        throw new RuntimeException("schema.sql not found at {$schemaPath}");
    }

    echo "[2/3] Applying schema (tables, constraints, indexes)...\n";
    $sql = file_get_contents($schemaPath);
    if ($sql === false) {
        throw new RuntimeException("Could not read {$schemaPath}");
    }

    $database->exec($sql);
    echo "      Schema applied successfully.\n";

    // 2. Run seed script
    echo "[3/3] Seeding catalog data...\n";
    require __DIR__ . '/seed.php';

    echo "\n>>> Database setup completed successfully! <<<\n";
} catch (Throwable $e) {
    fwrite(STDERR, "\n[ERROR] Database setup failed:\n" . $e->getMessage() . "\n\n");
    fwrite(STDERR, "Please check your DATABASE_URL in .env file or PostgreSQL service.\n");
    exit(1);
}
