<?php
require __DIR__ . '/config.php';
requireMethod('POST');
$user = requireAuth(['admin', 'manager']);

$d = input();
$table = (string)($d['table'] ?? '');
tableConfig($table, $user);
$values = prepareValues($pdo, $table, (array)($d['row'] ?? []), true);

$cols = implode(', ', array_map(fn($c) => "`$c`", array_keys($values)));
$marks = implode(', ', array_fill(0, count($values), '?'));
try {
    $pdo->prepare("INSERT INTO `$table` ($cols) VALUES ($marks)")->execute(array_values($values));
} catch (PDOException $e) {
    dbError($e);
}
respond(['message' => 'Запись добавлена', 'id' => (int)$pdo->lastInsertId()], 201);
