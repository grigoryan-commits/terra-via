<?php
require __DIR__ . '/db.php';
requireMethod('POST');

$d = input();
$email = mb_strtolower(clean($d['email'] ?? '', 120));
$password = (string)($d['password'] ?? '');

if ($email === '' || $password === '') {
    respond(['message' => 'Заполните все поля'], 422);
}

$attempts = $_SESSION['login_attempts'] ?? ['count' => 0, 'time' => time()];
if ($attempts['count'] >= 5 && time() - $attempts['time'] < 300) {
    respond(['message' => 'Слишком много попыток. Повторите через 5 минут'], 429);
}

$stmt = $pdo->prepare('SELECT id_user, last_name, first_name, email, phone, password_hash, role FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    $_SESSION['login_attempts'] = ['count' => $attempts['count'] + 1, 'time' => time()];
    respond(['message' => 'Неверный e-mail или пароль'], 401);
}

unset($user['password_hash'], $_SESSION['login_attempts']);
session_regenerate_id(true);
$_SESSION['user'] = $user;
respond(['user' => $user]);
