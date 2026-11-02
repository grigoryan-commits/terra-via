<?php
require __DIR__ . '/db.php';
requireMethod('POST');

$d = input();
$lastName = clean($d['lastName'] ?? '', 60);
$firstName = clean($d['firstName'] ?? '', 60);
$email = mb_strtolower(clean($d['email'] ?? '', 120));
$phone = clean($d['phone'] ?? '', 20);
$password = (string)($d['password'] ?? '');

$errors = [];
if ($lastName === '' || $firstName === '' || $email === '' || $phone === '' || $password === '') {
    respond(['message' => 'Заполните все поля'], 422);
}
if (!preg_match('/^[А-ЯЁа-яёA-Za-z\- ]{2,60}$/u', $lastName) || !preg_match('/^[А-ЯЁа-яёA-Za-z\- ]{2,60}$/u', $firstName)) {
    $errors[] = 'Имя и фамилия могут содержать только буквы и дефис';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Некорректный e-mail';
}
if (!validPhone($phone)) {
    $errors[] = 'Некорректный номер телефона';
}
if (mb_strlen($password) < 8 || !preg_match('/\d/', $password) || !preg_match('/[A-Za-zА-Яа-я]/u', $password)) {
    $errors[] = 'Пароль должен быть не короче 8 символов и содержать буквы и цифры';
}
if ($errors) {
    respond(['message' => implode('. ', $errors)], 422);
}

$stmt = $pdo->prepare('SELECT id_user FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    respond(['message' => 'Пользователь с таким e-mail уже зарегистрирован'], 409);
}

$stmt = $pdo->prepare('INSERT INTO users (last_name, first_name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)');
$stmt->execute([$lastName, $firstName, $email, $phone, password_hash($password, PASSWORD_DEFAULT)]);

respond(['message' => 'Регистрация прошла успешно. Войдите в аккаунт'], 201);
