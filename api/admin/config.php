<?php
require __DIR__ . '/../db.php';

const TABLES = [
    'users' => ['pk' => 'id_user', 'title' => 'Пользователи', 'roles' => ['admin'], 'hidden' => ['password_hash']],
    'countries' => ['pk' => 'id_country', 'title' => 'Страны', 'roles' => ['admin']],
    'hotels' => ['pk' => 'id_hotel', 'title' => 'Отели', 'roles' => ['admin']],
    'tours' => ['pk' => 'id_tour', 'title' => 'Туры', 'roles' => ['admin']],
    'departures' => ['pk' => 'id_departure', 'title' => 'Вылеты', 'roles' => ['admin', 'manager']],
    'bookings' => ['pk' => 'id_booking', 'title' => 'Бронирования', 'roles' => ['admin', 'manager']],
    'payments' => ['pk' => 'id_payment', 'title' => 'Оплаты', 'roles' => ['admin', 'manager']],
    'reviews' => ['pk' => 'id_review', 'title' => 'Отзывы', 'roles' => ['admin', 'manager']],
    'requests' => ['pk' => 'id_request', 'title' => 'Заявки', 'roles' => ['admin', 'manager']],
];

const VIEWS = [
    'view1_tours_catalog' => 'Каталог туров с минимальной ценой',
    'view2_available_departures' => 'Вылеты со свободными местами',
    'view3_bookings_full' => 'Бронирования с данными клиентов',
    'view4_revenue_by_country' => 'Выручка по странам',
    'view5_popular_tours' => 'Популярность туров',
    'view6_client_stats' => 'Статистика по клиентам',
    'view7_tour_ratings' => 'Рейтинг туров по отзывам',
    'view8_new_requests' => 'Необработанные заявки',
    'view9_occupancy' => 'Заполняемость вылетов',
    'view10_monthly_sales' => 'Продажи по месяцам',
];

function tableConfig(string $table, array $user): array
{
    if (!isset(TABLES[$table])) {
        respond(['message' => 'Неизвестная таблица'], 400);
    }
    $cfg = TABLES[$table];
    if (!in_array($user['role'], $cfg['roles'], true)) {
        respond(['message' => 'Недостаточно прав для этой таблицы'], 403);
    }
    return $cfg;
}

function tableColumns(PDO $pdo, string $table): array
{
    $stmt = $pdo->prepare(
        'SELECT COLUMN_NAME AS name, DATA_TYPE AS type, COLUMN_TYPE AS column_type, IS_NULLABLE AS nullable,
                COLUMN_DEFAULT AS def, EXTRA AS extra
         FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION'
    );
    $stmt->execute([DB_NAME, $table]);
    return $stmt->fetchAll();
}

function prepareValues(PDO $pdo, string $table, array $row, bool $isInsert): array
{
    $cfg = TABLES[$table];
    $values = [];
    foreach (tableColumns($pdo, $table) as $col) {
        $name = $col['name'];
        if ($name === $cfg['pk'] || str_contains($col['extra'], 'auto_increment')) {
            continue;
        }
        if ($table === 'users' && $name === 'password_hash') {
            $password = (string)($row['password'] ?? '');
            if ($password !== '') {
                if (mb_strlen($password) < 8) {
                    respond(['message' => 'Пароль должен быть не короче 8 символов'], 422);
                }
                $values[$name] = password_hash($password, PASSWORD_DEFAULT);
            } elseif ($isInsert) {
                respond(['message' => 'Укажите пароль нового пользователя'], 422);
            }
            continue;
        }
        if (!array_key_exists($name, $row)) {
            continue;
        }
        $value = $row[$name];
        if ($value === '' || $value === null) {
            if ($col['nullable'] === 'NO' && $col['def'] === null) {
                respond(['message' => 'Поле «' . $name . '» обязательно для заполнения'], 422);
            }
            if ($col['nullable'] === 'YES') {
                $values[$name] = null;
            }
            continue;
        }
        $value = trim(strip_tags((string)$value));
        if (in_array($col['type'], ['int', 'tinyint', 'smallint', 'decimal'], true) && !is_numeric($value)) {
            respond(['message' => 'Поле «' . $name . '» должно быть числом'], 422);
        }
        if ($col['type'] === 'date' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            respond(['message' => 'Поле «' . $name . '» должно быть датой в формате ГГГГ-ММ-ДД'], 422);
        }
        if ($col['type'] === 'enum') {
            preg_match_all("/'((?:[^']|'')*)'/", $col['column_type'], $m);
            if (!in_array($value, $m[1], true)) {
                respond(['message' => 'Недопустимое значение поля «' . $name . '»'], 422);
            }
        }
        if ($name === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            respond(['message' => 'Некорректный e-mail'], 422);
        }
        $values[$name] = $value;
    }
    if (!$values) {
        respond(['message' => 'Нет данных для сохранения'], 422);
    }
    return $values;
}

function dbError(PDOException $e): never
{
    $code = $e->errorInfo[1] ?? 0;
    $message = match ((int)$code) {
        1062 => 'Запись с таким значением уже существует',
        1451 => 'Нельзя удалить запись: на неё ссылаются другие таблицы',
        1452 => 'Указан несуществующий внешний ключ',
        4025, 3819 => 'Значение нарушает ограничение таблицы',
        default => 'Ошибка базы данных',
    };
    respond(['message' => $message], 422);
}
