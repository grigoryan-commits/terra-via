<?php
require __DIR__ . '/config.php';
requireAuth(['admin', 'manager']);

$view = (string)($_GET['view'] ?? '');
if (!isset(VIEWS[$view])) {
    respond(['message' => 'Неизвестное представление'], 400);
}
$rows = $pdo->query("SELECT * FROM `$view`")->fetchAll();
respond(['view' => $view, 'title' => VIEWS[$view], 'rows' => $rows]);
