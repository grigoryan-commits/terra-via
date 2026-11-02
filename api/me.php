<?php
require __DIR__ . '/db.php';
respond(['user' => currentUser()]);
