<?php

namespace App\Services\Kobo;

use Illuminate\Support\Facades\Log;

class KoboSyncService
{
    public function __construct(
        protected ?string $baseUrl = null,
        protected ?string $token = null,
        protected ?array $formIds = null,
    ) {
        $this->baseUrl = $this->baseUrl ?? env('KOBO_BASE_URL');
        $this->token = $this->token ?? env('KOBO_TOKEN');
        $this->formIds = $this->formIds ?? array_filter(explode(',', env('KOBO_FORM_IDS', '')));
    }

    public function sync(): int
    {
        Log::info('KOBO sync stub - configure credentials to enable');
        return 0;
    }

    public function getFormIds(): array
    {
        return $this->formIds ?? [];
    }
}
