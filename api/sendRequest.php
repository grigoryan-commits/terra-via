<?php
require __DIR__ . '/db.php';
requireMethod('POST');

$d = input();
$name = clean($d['name'] ?? '', 100);
$phone = clean($d['phone'] ?? '', 20);
$email = clean($d['email'] ?? '', 120);
$topic = in_array($d['topic'] ?? '', ['Подбор тура', 'Бронирование', 'Визы и документы', 'Другое'], true) ? $d['topic'] : 'Подбор тура';
$message = clean($d['message'] ?? '', 1000);

if ($name === '' || $phone === '') {
    respond(['message' => 'Укажите имя и телефон'], 422);
}
if (!validPhone($phone)) {
    respond(['message' => 'Некорректный номер телефона'], 422);
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(['message' => 'Некорректный e-mail'], 422);
}
if (empty($d['agree'])) {
    respond(['message' => 'Необходимо согласие на обработку персональных данных'], 422);
}

$pdo->prepare('INSERT INTO requests (name, phone, email, topic, message) VALUES (?, ?, ?, ?, ?)')
    ->execute([$name, $phone, $email ?: null, $topic, $message ?: null]);
respond(['message' => 'Заявка отправлена. Менеджер перезвонит в течение 15 минут'], 201);
