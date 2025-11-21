<?php

namespace App\Service\Renderer;

use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;

#[AutoconfigureTag('app.field_renderer')]
interface FieldRendererInterface
{
    public function render(mixed $value, array $options): mixed;
    public static function getAlias(): string;
}