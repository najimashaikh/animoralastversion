<?php
require_method('GET');

$statement = db()->query(
    'SELECT id, title, category, difficulty, problem, task, hint, solution,
            related_course AS "relatedCourse", related_tutorial AS "relatedTutorial",
            created_at, updated_at
     FROM problems ORDER BY category, id'
);
json_response(['problems' => $statement->fetchAll()]);