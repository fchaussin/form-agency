<?php

namespace App\Service;

use Symfony\Component\Validator\Constraints as Assert;

class ValidationMapper
{
    public function mapRules(array $rules): array
    {
        $constraints = [];

        if ($rules['required'] ?? false) {
            $constraints[] = new Assert\NotBlank(message: 'Ce champ est obligatoire.');
        }
        if ($rules['email'] ?? false) {
            $constraints[] = new Assert\Email(message: 'Email invalide.');
        }
        if (isset($rules['min'])) {
            $constraints[] = new Assert\GreaterThanOrEqual(value: $rules['min']);
        }
        if (isset($rules['max'])) {
            $constraints[] = new Assert\LessThanOrEqual(value: $rules['max']);
        }
        // Ajoute d'autres règles (regex, length...) ici selon besoin

        return $constraints;
    }
}