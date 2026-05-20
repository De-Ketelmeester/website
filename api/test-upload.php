<?php
/**
 * Dry-run for Google Ads UploadClickConversions, with verbose diagnostics.
 *
 * Two ways to invoke:
 *   1. CLI:  php api/test-upload.php
 *   2. HTTP: https://www.deketelmeester.nl/api/test-upload.php?key=<TEST_KEY>
 *
 * Delete this file after you're done testing.
 */

const TEST_KEY = 'aK7mPn2xQv9LR4hG6sBdY3wN8tCfE1jZ';

// Force errors to surface so we can see fatal issues
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

$isCli = (PHP_SAPI === 'cli');

if (!$isCli) {
    header('Content-Type: text/plain; charset=utf-8');
    if (($_GET['key'] ?? '') !== TEST_KEY) {
        http_response_code(403);
        exit("Forbidden — missing or wrong key.\n");
    }
}

// Disable any output buffering so each step shows up immediately
while (ob_get_level() > 0) ob_end_flush();
ob_implicit_flush(true);

function out(string $msg): void {
    echo $msg . "\n";
    @flush();
}

out('Google Ads UploadClickConversions dry-run');
out(str_repeat('=', 60));
out('PHP version:        ' . PHP_VERSION);
out('cURL extension:     ' . (extension_loaded('curl') ? 'loaded' : 'MISSING'));
out('OpenSSL extension:  ' . (extension_loaded('openssl') ? 'loaded' : 'MISSING'));
out('JSON extension:     ' . (extension_loaded('json') ? 'loaded' : 'MISSING'));
out('max_execution_time: ' . ini_get('max_execution_time') . 's');
out('memory_limit:       ' . ini_get('memory_limit'));
out(str_repeat('-', 60));

require_once __DIR__ . '/google-ads-uploader.php';
out('Loaded uploader.');

out('Customer ID:        ' . ($_ENV['GADS_CUSTOMER_ID']       ?? '(missing)'));
out('Login Customer ID:  ' . ($_ENV['GADS_LOGIN_CUSTOMER_ID'] ?? '(missing)'));
out('Dev token present:  ' . (!empty($_ENV['GADS_DEVELOPER_TOKEN']) ? 'yes (' . strlen($_ENV['GADS_DEVELOPER_TOKEN']) . ' chars)' : 'NO'));
out('Client ID present:  ' . (!empty($_ENV['GADS_CLIENT_ID']) ? 'yes' : 'NO'));
out('Refresh token present: ' . (!empty($_ENV['GADS_REFRESH_TOKEN']) ? 'yes' : 'NO'));

// Test outbound HTTPS connectivity first — if this hangs, the hoster is blocking outbound traffic
out(str_repeat('-', 60));
out('Testing outbound HTTPS to oauth2.googleapis.com ...');
$ch = curl_init('https://oauth2.googleapis.com/');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_NOBODY         => true,
    CURLOPT_TIMEOUT        => 8,
    CURLOPT_CONNECTTIMEOUT => 5,
]);
curl_exec($ch);
$connCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$connErr  = curl_error($ch);
curl_close($ch);
out("  HTTP $connCode" . ($connErr ? "  ERR: $connErr" : '  OK'));

out('Testing outbound HTTPS to googleads.googleapis.com ...');
$ch = curl_init('https://googleads.googleapis.com/');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_NOBODY         => true,
    CURLOPT_TIMEOUT        => 8,
    CURLOPT_CONNECTTIMEOUT => 5,
]);
curl_exec($ch);
$connCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$connErr  = curl_error($ch);
curl_close($ch);
out("  HTTP $connCode" . ($connErr ? "  ERR: $connErr" : '  OK'));

out(str_repeat('-', 60));
out('Step 1: refresh OAuth access token...');
$accessToken = getGadsAccessToken();
if ($accessToken === null) {
    out('  FAIL — getGadsAccessToken returned null. See server error log for details.');
    out('  Common causes: OAuth credentials wrong/expired in .env, cURL blocked, or refresh token revoked.');
    exit;
}
out('  OK — got access token (' . strlen($accessToken) . ' chars)');

$actions = [
    'lead_call_click_api'     => $_ENV['GADS_CONV_CALL']     ?? '',
    'lead_whatsapp_click_api' => $_ENV['GADS_CONV_WHATSAPP'] ?? '',
    'lead_form_submit_api'    => $_ENV['GADS_CONV_FORM']     ?? '',
];

$syntheticGclid = 'TEST_VALIDATE_ONLY_' . bin2hex(random_bytes(8));
$now            = formatGadsConversionDateTime('now');

out(str_repeat('-', 60));
out("Synthetic GCLID:    $syntheticGclid");
out("Conversion time:    $now");
out(str_repeat('=', 60));

foreach ($actions as $name => $resource) {
    out("\n→ $name");
    out("  resource: $resource");

    if ($resource === '') {
        out('  SKIP: env var not set');
        continue;
    }

    try {
        $result = uploadClickConversion(
            $resource,
            $syntheticGclid,
            null,
            null,
            $now,
            50.0,
            'EUR',
            true   // validateOnly = true
        );
        out('  HTTP ' . $result['status'] . ($result['ok'] ? '  OK' : '  FAIL'));
        out('  response: ' . substr($result['response'], 0, 1000));
    } catch (Throwable $e) {
        out('  EXCEPTION: ' . $e->getMessage());
        out('  trace: ' . $e->getTraceAsString());
    }
}

out("\n" . str_repeat('=', 60));
out('Done. See logs/gads-uploads.log for the full audit trail.');
