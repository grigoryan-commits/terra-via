<?php
declare(strict_types=1);

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'path' => '/']);
session_start();

const DB_HOST = 'localhost';
const DB_NAME = 'terravia_db';
const DB_USER = 'root';
const DB_PASS = '';

try {
    $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    respond(['message' => 'Нет подключения к базе данных'], 500);
}

function respond(array $data, int $code = 200): never
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function input(): array
{
    $data = json_decode(file_get_contents('php://input') ?: '', true);
    return is_array($data) ? $data : [];
}

function requireMethod(string $method): void
{
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        respond(['message' => 'Метод не поддерживается'], 405);
    }
}

function currentUser(): ?array
{
    return $_SESSION['user'] ?? null;
}

function requireAuth(array $roles = []): array
{
    $user = currentUser();
    if (!$user) {
        respond(['message' => 'Требуется авторизация'], 401);
    }
    if ($roles && !in_array($user['role'], $roles, true)) {
        respond(['message' => 'Недостаточно прав'], 403);
    }
    return $user;
}

function clean(mixed $value, int $max = 255): string
{
    return mb_substr(trim(strip_tags((string)($value ?? ''))), 0, $max);
}

function validPhone(string $phone): bool
{
    return (bool)preg_match('/^\+?[0-9\s\-\(\)]{10,20}$/', $phone);
}
