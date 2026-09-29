<?php
declare(strict_types=1);

require_once __DIR__ . '/connection.php';

echo "\n======================================================\n";
echo "           ANIMORA CONTACT MESSAGES                   \n";
echo "======================================================\n\n";

try {
    $db = db();
    $localMessages = $db->query('SELECT id, name, email, subject, message, status, created_at FROM contact_messages ORDER BY id DESC')->fetchAll();

    // Also fetch from Supabase Cloud database
    $supabaseUrl = env_value('VITE_SUPABASE_URL', 'https://kfngsvnxsqhmkojdppll.supabase.co');
    $supabaseKey = env_value('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmbmdzdm54c3FobWtvamRwcGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Mjc0MDYsImV4cCI6MjEwNjEwMzQwNn0.qInFDqhb89xeKgS2YqzJskQ4pUpgpl3TBIF3c1_E-HE');

    $supabaseMessages = [];
    if (function_exists('curl_init') && !empty($supabaseUrl) && !empty($supabaseKey)) {
        $ch = curl_init($supabaseUrl . '/rest/v1/contact_messages?select=*&order=created_at.desc');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'apikey: ' . $supabaseKey,
            'Authorization: Bearer ' . $supabaseKey,
            'Accept: application/json',
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 6);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300 && $response) {
            $decoded = json_decode($response, true);
            if (is_array($decoded)) {
                $supabaseMessages = $decoded;
            }
        }
    }

    // Sync any Supabase messages into local database if missing
    if (!empty($supabaseMessages)) {
        $existingEmailsAndDates = [];
        foreach ($localMessages as $lm) {
            $existingEmailsAndDates[$lm['email'] . '|' . $lm['created_at']] = true;
        }

        $insertStmt = $db->prepare('INSERT INTO contact_messages (name, email, subject, message, status, created_at) VALUES (:name, :email, :subject, :message, :status, :created_at)');
        foreach ($supabaseMessages as $sm) {
            $key = ($sm['email'] ?? '') . '|' . ($sm['created_at'] ?? '');
            if (!isset($existingEmailsAndDates[$key])) {
                try {
                    $insertStmt->execute([
                        'name' => $sm['name'] ?? '',
                        'email' => $sm['email'] ?? '',
                        'subject' => $sm['subject'] ?? '',
                        'message' => $sm['message'] ?? '',
                        'status' => $sm['status'] ?? 'new',
                        'created_at' => $sm['created_at'] ?? date('Y-m-d H:i:s'),
                    ]);
                    $existingEmailsAndDates[$key] = true;
                } catch (Throwable $e) {
                    // Ignore duplicate or constraint warnings
                }
            }
        }
        // Refresh local messages list
        $localMessages = $db->query('SELECT id, name, email, subject, message, status, created_at FROM contact_messages ORDER BY id DESC')->fetchAll();
    }

    $messages = !empty($localMessages) ? $localMessages : $supabaseMessages;

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
