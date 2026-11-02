<?php
require __DIR__ . '/config.php';
$user = requireAuth(['admin', 'manager']);

$tables = [];
foreach (TABLES as $name => $cfg) {
    if (in_array($user['role'], $cfg['roles'], true)) {
        $tables[] = ['name' => $name, 'title' => $cfg['title']];
    }
}
$views = [];
foreach (VIEWS as $name => $title) {
    $views[] = ['name' => $name, 'title' => $title];
}
respond(['tables' => $tables, 'views' => $views, 'user' => $user]);
