<?php
require __DIR__ . '/db.php';
requireMethod('POST');
$user = requireAuth(['client', 'manager', 'admin']);

$d = input();
$departureId = (int)($d['departureId'] ?? 0);
$persons = (int)($d['persons'] ?? 0);
$comment = clean($d['comment'] ?? '', 500);

if ($departureId <= 0 || $persons < 1 || $persons > 10) {
    respond(['message' => 'Выберите дату вылета и количество туристов от 1 до 10'], 422);
}

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare('SELECT price, seats_left, date_start FROM departures WHERE id_departure = ? FOR UPDATE');
    $stmt->execute([$departureId]);
    $dep = $stmt->fetch();

    if (!$dep) {
        $pdo->rollBack();
        respond(['message' => 'Вылет не найден'], 404);
    }
    if ($dep['date_start'] < date('Y-m-d')) {
        $pdo->rollBack();
        respond(['message' => 'Этот вылет уже состоялся'], 422);
    }
    if ((int)$dep['seats_left'] < $persons) {
        $pdo->rollBack();
        respond(['message' => 'Недостаточно свободных мест. Осталось: ' . $dep['seats_left']], 409);
    }

    $total = (float)$dep['price'] * $persons;
    $pdo->prepare('UPDATE departures SET seats_left = seats_left - ? WHERE id_departure = ?')->execute([$persons, $departureId]);
    $pdo->prepare('INSERT INTO bookings (id_user, id_departure, persons, total_price, comment) VALUES (?, ?, ?, ?, ?)')
        ->execute([$user['id_user'], $departureId, $persons, $total, $comment ?: null]);
    $id = (int)$pdo->lastInsertId();
    $pdo->commit();
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    respond(['message' => 'Не удалось оформить бронирование'], 500);
}

respond(['message' => 'Тур забронирован. Номер заявки: ' . $id, 'id' => $id, 'total' => $total], 201);
