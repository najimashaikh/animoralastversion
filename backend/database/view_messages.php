<?php
declare(strict_types=1);

require_once __DIR__ . '/connection.php';

echo "\n======================================================\n";
echo "           ANIMORA CONTACT MESSAGES                   \n";
echo "======================================================\n\n";

try {
    $messages = db()->query('SELECT id, name, email, subject, message, status, created_at FROM contact_messages ORDER BY id DESC')->fetchAll();

    if (empty($messages)) {
        echo "No contact messages received yet.\n";
        echo "Submit a message from the website contact form to test!\n\n";
        exit(0);
    }

    echo "Total Messages: " . count($messages) . "\n\n";

    foreach ($messages as $msg) {
        echo "------------------------------------------------------\n";
        echo "ID:      #{$msg['id']}\n";
        echo "Name:    {$msg['name']}\n";
        echo "Email:   {$msg['email']}\n";
        echo "Subject: {$msg['subject']}\n";
        echo "Date:    {$msg['created_at']}\n";
        echo "Status:  {$msg['status']}\n";
        echo "Message:\n{$msg['message']}\n";
        echo "------------------------------------------------------\n\n";
    }
} catch (Throwable $e) {
    fwrite(STDERR, "Error fetching messages: " . $e->getMessage() . "\n");
    exit(1);
}
