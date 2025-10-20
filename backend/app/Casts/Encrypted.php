<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Encryption\Encrypter;

class Encrypted implements CastsAttributes
{
    protected Encrypter $encrypter;

    public function __construct()
    {
        $key = config('app.column_encryption_key') ?? env('COLUMN_ENCRYPTION_KEY');
        if (!$key) {
            $this->encrypter = app('encrypter');
        } else {
            $key = str_starts_with($key, 'base64:') ? base64_decode(substr($key, 7)) : $key;
            $this->encrypter = new Encrypter($key, config('app.cipher'));
        }
    }

    public function get($model, string $key, $value, array $attributes)
    {
        if (is_null($value)) return null;
        try {
            return $this->encrypter->decrypt($value);
        } catch (\Throwable $e) {
            return null;
        }
    }

    public function set($model, string $key, $value, array $attributes)
    {
        if (is_null($value) || $value === '') return null;
        return $this->encrypter->encrypt($value);
    }
}
