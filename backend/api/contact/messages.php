<?php
require_method('POST');

$input = json_body();
$name = required_string($input, 'name', 120);
$email = valid_email(required_string($input, 'email', 255));
$subject = required_string($input, 'subject', 180);
$message = required_string($input, 'message', 20000);

$statement = db()->prepare(
    'INSERT INTO contact_messages (name, email, subject, message)
     VALUES (:name, :email, :subject, :message)
     RETURNING id, name, email, subject, status, created_at'
);
$statement->execute([
    'name' => $name,
    'email' => $email,
    'subject' => $subject,
    'message' => $message,
]);

json_response(['message' => $statement->fetch()], 201);