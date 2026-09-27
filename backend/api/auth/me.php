<?php
require_method('GET');

$user = current_user();
if ($user === null) {
    error_response('Authentication required.', 401);
}

json_response(['user' => $user]);