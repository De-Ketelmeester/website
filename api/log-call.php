<?php
// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Get the user's IP address
function getUserIP() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return trim($ip);
}

// Parse user agent to extract browser and OS info
function parseUserAgent($userAgent) {
    $browser = 'Unknown';
    $os = 'Unknown';
    
    // Detect Operating System
    if (preg_match('/windows|win32/i', $userAgent)) {
        $os = 'Windows';
    } elseif (preg_match('/macintosh|mac os x/i', $userAgent)) {
        $os = 'macOS';
    } elseif (preg_match('/linux/i', $userAgent)) {
        $os = 'Linux';
    } elseif (preg_match('/iphone|ios/i', $userAgent)) {
        $os = 'iOS';
    } elseif (preg_match('/android/i', $userAgent)) {
        $os = 'Android';
    }
    
    // Detect Browser
    if (preg_match('/edg/i', $userAgent)) {
        $browser = 'Edge';
    } elseif (preg_match('/chrome|chromium|crios/i', $userAgent)) {
        $browser = 'Chrome';
    } elseif (preg_match('/firefox/i', $userAgent)) {
        $browser = 'Firefox';
    } elseif (preg_match('/safari/i', $userAgent)) {
        $browser = 'Safari';
    } elseif (preg_match('/opr|opera/i', $userAgent)) {
        $browser = 'Opera';
    }
    
    return ['browser' => $browser, 'os' => $os];
}

// Get geolocation from IP
function getGeolocation($ip) {
    // Try multiple free geolocation APIs
    $geolocation = [
        'city' => 'Unknown',
        'region' => 'Unknown',
        'country' => 'Unknown'
    ];
    
    try {
        // Using ip-api.com (free tier, requires no key)
        $response = @file_get_contents("http://ip-api.com/json/$ip?fields=city,regionName,country");
        if ($response) {
            $data = json_decode($response, true);
            if (isset($data['city'])) {
                $geolocation['city'] = $data['city'];
                $geolocation['region'] = $data['regionName'] ?? 'Unknown';
                $geolocation['country'] = $data['country'] ?? 'Unknown';
            }
        }
    } catch (Exception $e) {
        // Continue with unknown location
    }
    
    return $geolocation;
}

// Format session duration nicely
function formatSessionDuration($seconds) {
    if ($seconds < 60) {
        return $seconds . 's';
    } elseif ($seconds < 3600) {
        $minutes = intdiv($seconds, 60);
        $secs = $seconds % 60;
        return $minutes . 'm ' . $secs . 's';
    } else {
        $hours = intdiv($seconds, 3600);
        $minutes = intdiv($seconds % 3600, 60);
        return $hours . 'h ' . $minutes . 'm';
    }
}

// Set response header
header('Content-Type: application/json');

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['userAgent']) || !isset($data['timestamp'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required data']);
    exit;
}

// Get and parse user information
$ip = getUserIP();
$userAgent = $data['userAgent'];
$timestamp = $data['timestamp'];
$currentPage = $data['currentPage'] ?? 'Unknown';
$serviceType = $data['serviceType'] ?? 'General';
$deviceType = $data['deviceType'] ?? 'Unknown';
$referrer = $data['referrer'] ?? 'Direct';
$referrerSource = $data['referrerSource'] ?? 'Direct';
$sessionDuration = $data['sessionDuration'] ?? 0;
$scrollDepth = $data['scrollDepth'] ?? 0;

// Parse browser and OS
$browserInfo = parseUserAgent($userAgent);
$browser = $browserInfo['browser'];
$os = $browserInfo['os'];

// Get geolocation
$geolocation = getGeolocation($ip);
$city = $geolocation['city'];
$region = $geolocation['region'];
$country = $geolocation['country'];

// Format session duration
$formattedDuration = formatSessionDuration($sessionDuration);

// Email settings
$to = 'ridaem@outlook.com';
$subject = '📞 NEW LEAD - Call Button Clicked';
$phoneNumber = '085 0041138';

// Create HTML email body
$emailBody = "
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; background: #f9f9f9; padding: 0; border-radius: 8px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 25px; text-align: center; }
        .header h2 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0 0 0; opacity: 0.9; font-size: 14px; }
        .section { padding: 20px; border-bottom: 1px solid #e0e0e0; }
        .section:last-child { border-bottom: none; }
        .section-title { font-weight: bold; color: #007bff; font-size: 14px; text-transform: uppercase; margin-bottom: 12px; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .info-label { font-weight: 600; color: #555; min-width: 150px; }
        .info-value { color: #333; text-align: right; flex: 1; }
        .highlight { background: #fff3cd; padding: 1px 6px; border-radius: 3px; }
        .location-badge { background: #007bff; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; display: inline-block; }
        .footer { background: #f0f0f0; padding: 15px; font-size: 12px; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>📞 NEW LEAD INCOMING</h2>
            <p>Someone wants to call your business</p>
        </div>
        
        <div class='section'>
            <div class='section-title'>🎯 Call Action</div>
            <div class='info-row'>
                <span class='info-label'>Service:</span>
                <span class='info-value'><span class='highlight'>$serviceType</span></span>
            </div>
            <div class='info-row'>
                <span class='info-label'>Phone Number:</span>
                <span class='info-value'><strong>$phoneNumber</strong></span>
            </div>
            <div class='info-row'>
                <span class='info-label'>Date & Time:</span>
                <span class='info-value'>$timestamp</span>
            </div>
        </div>
        
        <div class='section'>
            <div class='section-title'>🌍 Location & Device</div>
            <div class='info-row'>
                <span class='info-label'>IP Address:</span>
                <span class='info-value'>$ip</span>
            </div>
            <div class='info-row'>
                <span class='info-label'>Location:</span>
                <span class='info-value'><span class='location-badge'>$city, $region - $country</span></span>
            </div>
            <div class='info-row'>
                <span class='info-label'>Device Type:</span>
                <span class='info-value'>$deviceType</span>
            </div>
            <div class='info-row'>
                <span class='info-label'>Browser:</span>
                <span class='info-value'>$browser on $os</span>
            </div>
        </div>
        
        <div class='section'>
            <div class='section-title'>📊 Engagement Data</div>
            <div class='info-row'>
                <span class='info-label'>Session Duration:</span>
                <span class='info-value'>$formattedDuration</span>
            </div>
            <div class='info-row'>
                <span class='info-label'>Page Scroll Depth:</span>
                <span class='info-value'>$scrollDepth%</span>
            </div>
            <div class='info-row'>
                <span class='info-label'>Traffic Source:</span>
                <span class='info-value'>$referrerSource</span>
            </div>
            <div class='info-row'>
                <span class='info-label'>Current Page:</span>
                <span class='info-value' style='word-break: break-all; font-size: 12px;'>$currentPage</span>
            </div>
        </div>
        
        <div class='footer'>
            <p style='margin: 0;'>🤖 Automated lead notification from deketelmeester.nl</p>
            <p style='margin: 5px 0 0 0;'>Generated at " . date('Y-m-d H:i:s') . " (CET)</p>
        </div>
    </div>
</body>
</html>
";

// Email headers
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: noreply@deketelmeester.nl\r\n";
$headers .= "Reply-To: support@deketelmeester.nl\r\n";

// Send email
$emailSent = mail($to, $subject, $emailBody, $headers);

// Optional: Log to file for backup
$logFile = __DIR__ . '/../logs/call-logs.txt';
if (!is_dir(__DIR__ . '/../logs')) {
    mkdir(__DIR__ . '/../logs', 0755, true);
}

$logEntry = "[" . date('Y-m-d H:i:s') . "] Service: $serviceType | Location: $city, $region | IP: $ip | Device: $deviceType | Duration: $formattedDuration | Referrer: $referrerSource\n";
file_put_contents($logFile, $logEntry, FILE_APPEND);

// Return response
echo json_encode([
    'success' => $emailSent,
    'message' => $emailSent ? 'Lead captured and email sent' : 'Lead captured but email failed',
    'leadData' => [
        'ip' => $ip,
        'location' => "$city, $region",
        'service' => $serviceType,
        'device' => $deviceType
    ]
]);
?>

