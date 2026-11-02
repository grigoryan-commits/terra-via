<?php
require __DIR__ . '/db.php';
$_SESSION = [];
session_destroy();
respond(['message' => 'Вы вышли из аккаунта']);
