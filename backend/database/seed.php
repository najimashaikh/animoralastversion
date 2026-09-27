<?php
declare(strict_types=1);

require_once __DIR__ . '/connection.php';

$database = db();
$database->beginTransaction();

try {
    $courseRows = [
        ['2D', 'Fundamentals of 2D Animation', 'FOUNDATION', '3h 40m'],
        ['2D', 'Principles of Animation', 'FOUNDATION', '4h 20m'],
        ['2D', 'Character Animation', 'FOUNDATION', '3h 40m'],
        ['2D', 'Storyboarding', 'FOUNDATION', '4h 20m'],
        ['2D', 'Digital Illustration', 'FOUNDATION', '3h 40m'],
        ['2D', 'Motion Graphics', 'FOUNDATION', '4h 20m'],
        ['3D', 'Introduction to 3D Animation', 'INTERMEDIATE', '3h 40m'],
        ['3D', '3D Modeling Fundamentals', 'INTERMEDIATE', '4h 20m'],
        ['3D', 'Texturing and Materials', 'INTERMEDIATE', '3h 40m'],
        ['3D', 'Character Rigging', 'INTERMEDIATE', '4h 20m'],
        ['3D', '3D Character Animation', 'INTERMEDIATE', '3h 40m'],
        ['3D', 'Lighting and Rendering', 'INTERMEDIATE', '4h 20m'],
        ['3D', 'Environment Design', 'INTERMEDIATE', '3h 40m'],
        ['VFX', 'Introduction to VFX', 'WORKSHOP', '4h 20m'],
        ['VFX', 'Compositing Fundamentals', 'WORKSHOP', '3h 40m'],
        ['VFX', 'Green Screen / Chroma Key', 'WORKSHOP', '4h 20m'],
        ['VFX', 'Motion Tracking', 'WORKSHOP', '3h 40m'],
        ['VFX', 'Particle Effects', 'WORKSHOP', '4h 20m'],
        ['VFX', 'Cinematic Effects', 'WORKSHOP', '3h 40m'],
        ['VFX', 'Color Grading', 'WORKSHOP', '4h 20m'],
    ];
    $courseStatement = $database->prepare(
        'INSERT INTO courses (title, description, category, level, duration)
         SELECT :title, :description, :category, :level, :duration
         WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = :existing_title)'
    );
    foreach ($courseRows as [$category, $title, $level, $duration]) {
        $description = $category === '2D'
            ? 'Build a clear visual language through timing, drawing, posing and intentional movement.'
            : ($category === '3D'
                ? 'Develop dimensional thinking from first blockout through camera, light, material and motion.'
                : 'Learn the craft of compositing, simulation and finishing for images that feel fully realized.');
        $courseStatement->execute([
            'title' => $title,
            'existing_title' => $title,
            'description' => $description,
            'category' => $category,
            'level' => $level,
            'duration' => $duration,
        ]);
    }

    $tutorialRows = [
        ['Walk Cycle: Making Motion Read', 'Build a readable walk cycle by finding the contact, passing and weight-bearing poses first.', '2D', '14 MIN', 'https://www.youtube.com/watch?v=n_11DSOBmLc', '/animora-art.jpg'],
        ['Timing and Spacing in Practice', 'A focused study in how spacing choices change the energy, weight and intent of a shot.', '2D', '11 MIN', '', '/animora-hero.jpg'],
        ['3D Modeling Tutorial', 'Start with clean forms and a simple blockout, then build a model that is ready for detail.', '3D', '22 MIN', 'https://www.youtube.com/watch?v=1kSVb-VEhNc', '/animora-hero.jpg'],
        ['Light Before Texture', 'Use the key, fill and shadow relationship to make a scene feel intentional before adding surface detail.', '3D', '18 MIN', '', '/animora-art.jpg'],
        ['Green Screen: A Cleaner Composite', 'Key a green screen, match the light and integrate the subject into a believable plate.', 'VFX', '16 MIN', 'https://www.youtube.com/watch?v=5mf6hP9Cnp8', '/animora-hero.jpg'],
        ['Motion Tracking Basics', 'Track the world around a moving subject so digital elements inherit the same sense of place.', 'VFX', '09 MIN', '', '/animora-art.jpg'],
        ['Color Grading the Final Shot', 'Bring a finished image together by shaping contrast, color relationships and the final feeling.', 'VFX', '13 MIN', '', '/animora-hero.jpg'],
    ];
    $tutorialStatement = $database->prepare(
        'INSERT INTO tutorials (title, description, category, duration, video_url, thumbnail)
         SELECT :title, :description, :category, :duration, :video_url, :thumbnail
         WHERE NOT EXISTS (SELECT 1 FROM tutorials WHERE title = :existing_title)'
    );
    foreach ($tutorialRows as [$title, $description, $category, $duration, $videoUrl, $thumbnail]) {
        $tutorialStatement->execute([
            'title' => $title,
            'existing_title' => $title,
            'description' => $description,
            'category' => $category,
            'duration' => $duration,
            'video_url' => $videoUrl,
            'thumbnail' => $thumbnail,
        ]);
    }

    $problemRows = [
        ['2D', 'Beginner', 'Character Movement', 'Your character moves, but the action has no clear direction or weight.', 'Create a short movement with a readable beginning, change of direction and finish.', 'Thumbnail the strongest silhouette before refining any drawing.', 'Anchor the motion with a clear line of action, then use extreme and breakdown poses to keep the change visible.', 'Principles of Animation', 'Timing and Spacing in Practice'],
        ['2D', 'Beginner', 'Walk Cycle', 'The walk feels like sliding instead of a character carrying weight through space.', 'Animate a looping walk with clear contact, passing and push-off poses.', 'Check the feet first: the contact foot should stay planted while the body travels over it.', 'Use a consistent contact distance, offset the hips and shoulders, and make the spacing widen as the body pushes into the next step.', 'Character Animation', 'Walk Cycle: Making Motion Read'],
        ['2D', 'Intermediate', 'Timing and Spacing', 'The poses are correct, but the action still feels flat and evenly paced.', 'Revise a short shot so the viewer can feel acceleration, impact and settle.', 'Do not add frames everywhere. Remove or cluster them to change the rhythm.', 'Use wider spacing for speed, tighter spacing for held moments and a deliberate contrast at the story beat that matters most.', 'Principles of Animation', 'Timing and Spacing in Practice'],
        ['2D', 'Advanced', 'Lip Sync', 'The mouth shapes match the audio, but the dialogue does not feel connected to the character.', 'Animate a short line with clear phonemes and a believable performance.', 'Listen for the thought behind the words, not only the individual sounds.', 'Place the important vowel shapes on stressed syllables, add small anticipation and settle, and let the eyes and head support the line.', 'Character Animation', 'Timing and Spacing in Practice'],
        ['2D', 'Intermediate', 'Keyframe', 'The key poses communicate the idea, but the in-between motion loses the intent.', 'Create a clean keyframe pass for a single expressive action.', 'If the silhouette does not read in a thumbnail, more in-betweens will not fix it.', 'Clarify the line of action and hierarchy in the keys first, then choose breakdowns that preserve the force of the movement.', 'Fundamentals of 2D Animation', 'Timing and Spacing in Practice'],
        ['3D', 'Beginner', '3D Modeling', 'The model has surface detail, but the primary forms do not feel convincing.', 'Block out a simple prop using clean proportions and readable planes.', 'Judge the silhouette from a distance before adding bevels or texture.', 'Work from large to small, keep the topology supporting the form, and check the object under a neutral light before polishing.', '3D Modeling Fundamentals', '3D Modeling Tutorial'],
        ['3D', 'Intermediate', 'Rigging', 'The controls technically work, but the character bends in ways that break the form.', 'Build a simple rig with stable deformation through one clear pose change.', 'Test extreme poses early instead of waiting until the rig feels finished.', 'Place joints based on the intended deformation, use clean weight ranges, and add only the controls that make the motion easier to direct.', 'Character Rigging', '3D Modeling Tutorial'],
        ['3D', 'Advanced', 'Character Animation', 'The character hits the key poses, but the performance feels mechanical.', 'Animate a short acting beat with a clear intention and change.', 'Give the body a thought to react to before the limbs begin to move.', 'Lead with the idea, offset the body parts, and use asymmetry and holds to create a performance rather than a sequence of controls.', '3D Character Animation', 'Walk Cycle: Making Motion Read'],
        ['3D', 'Intermediate', 'Lighting', 'The scene is technically bright, but the focal point and depth are unclear.', 'Light a shot with a clear subject hierarchy and readable separation.', 'Start with one motivated key light before adding fill or rim light.', 'Use the key to establish direction, preserve shadow shape, then add restrained fill so the eye lands where the story needs it.', 'Lighting and Rendering', 'Light Before Texture'],
        ['3D', 'Advanced', 'Rendering', 'The final render looks different from the viewport and loses the intended mood.', 'Prepare a consistent render with correct color management and a deliberate finish.', 'Compare the same frame, exposure and color space before changing the lighting.', 'Lock the camera and render settings, preview at a small resolution, and make one controlled change at a time so the final image stays predictable.', 'Lighting and Rendering', 'Light Before Texture'],
        ['VFX', 'Beginner', 'Green Screen', 'The key is clean around the subject, but the composite still feels pasted on.', 'Key a subject and place it into a new plate with believable edges and light.', 'Solve spill and edge color before trying to hide the composite with a heavy grade.', 'Refine the matte, despill the edges, match the direction and softness of the plate light, then add shared grain and motion blur.', 'Compositing Fundamentals', 'Green Screen: A Cleaner Composite'],
        ['VFX', 'Intermediate', 'Motion Tracking', 'A tracked element drifts even though the tracker says the solve is successful.', 'Attach a digital element to a moving plate without visible sliding.', 'Track a high-contrast feature that belongs to the same plane as the element.', 'Use multiple points when needed, remove bad tracks, solve the correct plane and check the composite at full speed rather than only frame by frame.', 'Motion Tracking', 'Motion Tracking Basics'],
        ['VFX', 'Advanced', 'Compositing', 'The layers are aligned, but the final image lacks the small cues that make it feel photographed together.', 'Integrate a generated element into live-action footage with consistent depth and atmosphere.', 'Match the imperfections: lens softness, grain, shadow and color response.', 'Build the composite in passes, match perspective and light first, then finish with shared optical treatment so every layer belongs to the same image.', 'Compositing Fundamentals', 'Green Screen: A Cleaner Composite'],
        ['VFX', 'Intermediate', 'Particle Effects', 'The particles add activity but do not feel connected to the scene or the force driving them.', 'Create a controlled particle pass that supports the action without becoming visual noise.', 'Define the source, force and lifespan before choosing the look.', 'Shape the emission over time, vary scale and velocity with purpose, then integrate the pass with depth, motion blur and the scene light.', 'Particle Effects', 'Motion Tracking Basics'],
        ['VFX', 'Advanced', 'Color Grading', 'The grade is dramatic, but skin, highlights and the story focus are no longer trustworthy.', 'Finish a shot with a controlled palette that supports mood and continuity.', 'Protect the neutral references before pushing the creative look.', 'Balance exposure first, isolate the focal range, then shape contrast and hue relationships while checking the shot beside its neighboring frames.', 'Color Grading', 'Color Grading the Final Shot'],
    ];
    $problemStatement = $database->prepare(
        'INSERT INTO problems (category, difficulty, title, problem, task, hint, solution, related_course, related_tutorial)
         SELECT :category, :difficulty, :title, :problem, :task, :hint, :solution, :related_course, :related_tutorial
         WHERE NOT EXISTS (SELECT 1 FROM problems WHERE title = :existing_title)'
    );
    foreach ($problemRows as [$category, $difficulty, $title, $problem, $task, $hint, $solution, $relatedCourse, $relatedTutorial]) {
        $problemStatement->execute([
            'category' => $category,
            'difficulty' => $difficulty,
            'title' => $title,
            'existing_title' => $title,
            'problem' => $problem,
            'task' => $task,
            'hint' => $hint,
            'solution' => $solution,
            'related_course' => $relatedCourse,
            'related_tutorial' => $relatedTutorial,
        ]);
    }

    $adminEmail = env_value('ANIMORA_ADMIN_EMAIL', 'admin@animora.local');
    $adminPassword = env_value('ANIMORA_ADMIN_PASSWORD', 'Admin@12345');
    if ($adminEmail !== null && $adminPassword !== null && filter_var($adminEmail, FILTER_VALIDATE_EMAIL) && strlen($adminPassword) >= 8) {
        $adminStatement = $database->prepare(
            'INSERT INTO users (name, email, password_hash, role)
             VALUES (:name, :email, :password_hash, :role)
             ON CONFLICT (email) DO UPDATE
             SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, updated_at = NOW()'
        );
        $adminStatement->execute([
            'name' => 'Animora Admin',
            'email' => strtolower($adminEmail),
            'password_hash' => password_hash($adminPassword, PASSWORD_DEFAULT),
            'role' => 'admin',
        ]);
        echo "Default admin user ready: {$adminEmail}\n";
    }

    $database->commit();
    echo "Animora catalog seeded successfully.\n";
} catch (Throwable $exception) {
    $database->rollBack();
    fwrite(STDERR, $exception->getMessage() . "\n");
    exit(1);
}