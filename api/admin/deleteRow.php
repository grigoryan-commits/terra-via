<?php
require __DIR__ . '/config.php';
requireMethod('POST');
$user = requireAuth(['admin', 'manager']);

$d = input();
$table = (string)($d['table'] ?? '');
$cfg = tableConfig($table, $user);
$id = (int)($d['id'] ?? 0);

if ($table === 'users' && $id === (int)$user['id_user']) {
    respond(['message' => 'Нельзя удалить собственную учётную запись'], 422);
}

try {
    $stmt = $pdo->prepare("DELETE FROM `$table` WHERE `{$cfg['pk']}` = ?");
    $stmt->execute([$id]);
} catch (PDOException $e) {
    dbError($e);
}
if ($stmt->rowCount() === 0) {
    respond(['message' => 'Запись не найдена'], 404);
}
respond(['message' => 'Запись удалена']);
