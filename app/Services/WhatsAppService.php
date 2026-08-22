<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    public static function send($phone, $message)
    {
        $apiKey = env('WHATSAPP_API_KEY'); 
        $apiUrl = env('WHATSAPP_API_URL');

        if (!$apiKey || !$apiUrl || empty($phone)) {
            return false;
        }

        if (substr($phone, 0, 1) === '0') {
            $phone = '62' . substr($phone, 1);
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $apiKey, 
            ])->post($apiUrl, [
                'target' => $phone,
                'message' => $message,
            ]);

            Log::info("WA Terkirim ke {$phone}: " . $response->body());
            return true;
        } catch (\Exception $e) {
            Log::error("Gagal mengirim WA ke {$phone}: " . $e->getMessage());
            return false;
        }
    }
}