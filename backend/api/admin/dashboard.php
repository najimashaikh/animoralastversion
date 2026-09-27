<?php
require_admin();
require_method('GET');

$database = db();
$counts = [];
foreach (['users', 'projects', 'documents', 'contact_messages'] as $table) {
    if (!preg_match('/^[a-z_]+$/', $table)) {
        continue;
    }
    $counts[$table] = (int) $database->query("SELECT COUNT(*) FROM {$table}")->fetchColumn();
}

json_response(['counts' => $counts]);