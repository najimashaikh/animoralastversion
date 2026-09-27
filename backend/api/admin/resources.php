<?php
require_admin();
require_method('GET');

$resource = $_SERVER['ANIMORA_ADMIN_RESOURCE'] ?? '';
$queries = [
    'contact-messages' => 'SELECT id, name, email, subject, message, status, created_at FROM contact_messages ORDER BY created_at DESC',
    'projects' => 'SELECT p.id, p.title, p.description, p.status, p.created_at, p.updated_at, u.name AS user_name, u.email AS user_email FROM projects p JOIN users u ON u.id = p.user_id ORDER BY p.updated_at DESC',
    'documents' => 'SELECT d.id, d.project_id, d.title, d.content, d.document_type, d.created_at, d.updated_at, u.name AS user_name, u.email AS user_email FROM documents d JOIN users u ON u.id = d.user_id ORDER BY d.updated_at DESC',
    'courses' => 'SELECT id, title, description, category, level, duration, created_at, updated_at FROM courses ORDER BY category, id',
    'tutorials' => 'SELECT id, title, description, category, duration, video_url AS "videoUrl", thumbnail, created_at, updated_at FROM tutorials ORDER BY category, id',
    'problems' => 'SELECT id, title, category, difficulty, problem, task, hint, solution, related_course AS "relatedCourse", related_tutorial AS "relatedTutorial", created_at, updated_at FROM problems ORDER BY category, id',
];

if (!isset($queries[$resource])) {
    error_response('Admin resource not found.', 404);
}

$rows = db()->query($queries[$resource])->fetchAll();
json_response([$resource => $rows]);