<?php
declare(strict_types=1);
/* The booking form posts here (JSON or a plain form). Honeypot "website" must be empty; 10 posts a
   minute per IP; a name and a WhatsApp number are required. Every lead lands in the admin's inbox. */
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { json_out(['ok' => false, 'error' => 'method'], 405); return; }
$raw = (string) file_get_contents('php://input');
if (strlen($raw) > 10000) { json_out(['ok' => false, 'error' => 'too large'], 413); return; }
$isJson = str_contains(($_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? ''), 'json') || (!$_POST && $raw !== '' && $raw[0] === '{');
$body = $isJson ? (json_decode($raw, true) ?: []) : $_POST;
if (!is_array($body)) { json_out(['ok' => false, 'error' => 'bad json'], 400); return; }
if (!empty($body['website'])) { json_out(['ok' => true, 'id' => 'ignored']); return; }
$ip = trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? ($_SERVER['REMOTE_ADDR'] ?? 'local'))[0]);
$now = time();
q('DELETE FROM attempts WHERE at < ?', [$now - 600]);
if ((int) one('SELECT COUNT(*) c FROM attempts WHERE key = ? AND at > ?', ['lead:' . $ip, $now - 60])['c'] >= 10) { json_out(['ok' => false, 'error' => 'too many'], 429); return; }
q('INSERT INTO attempts (key, at) VALUES (?, ?)', ['lead:' . $ip, $now]);
$f = fn($k) => mb_substr(trim((string) ($body[$k] ?? '')), 0, 2000);
if ($f('name') === '' || ($f('whatsapp') === '' && $f('email') === '')) { json_out(['ok' => false, 'error' => 'name and a contact are required'], 422); return; }
$message = $f('message');
if ($message === '' && $f('area') !== '') $message = ($f('area_label') ?: 'Area') . ': ' . $f('area');
$id = bin2hex(random_bytes(8));
$referer = (string) ($_SERVER['HTTP_REFERER'] ?? '');
$lead = ['id' => $id, 'at' => gmdate('c'), 'name' => $f('name'), 'whatsapp' => $f('whatsapp'), 'email' => $f('email'), 'size' => $f('size'), 'need' => $f('need'), 'message' => $message, 'source' => $f('source') ?: $referer];
$rawRow = json_encode($lead + ['ip' => $ip, 'ua' => (string) ($_SERVER['HTTP_USER_AGENT'] ?? '')], JSON_UNESCAPED_UNICODE);
q('INSERT INTO inquiries (id,at,name,whatsapp,email,size,need,message,source,raw) VALUES (?,?,?,?,?,?,?,?,?,?)', [...array_values($lead), $rawRow]);
if (!$isJson && $referer !== '') { header('Location: ' . $referer . (str_contains($referer, '?') ? '&' : '?') . 'sent=1#contact'); return; }
json_out(['ok' => true, 'id' => $id]);
