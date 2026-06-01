<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // HTTPS hanya dipaksa JIKA APP_URL di .env menggunakan https (seperti Ngrok)
        if (str_contains(config('app.url'), 'https')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }
    }
}
