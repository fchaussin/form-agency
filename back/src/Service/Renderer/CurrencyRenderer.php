<?php

namespace App\Service\Renderer;

class CurrencyRenderer implements FieldRendererInterface
{
    public function render(mixed $value, array $options): string
    {
        if (!is_numeric($value)) return (string) $value;
        
        $currency = $options['currency'] ?? 'EUR';
        return number_format((float)$value, 2, ',', ' ') . ' ' . $currency;
    }

    public static function getAlias(): string
    {
        return 'currency';
    }
}