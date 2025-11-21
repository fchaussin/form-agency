<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\FieldType;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class FieldTypeFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $fieldTypes = [
            [
                'slug' => 'text',
                'label' => 'Texte court',
                'component' => 'Input',
                'dataType' => 'string',
                'defaultConfiguration' => ['type' => 'text'],
                'icon' => 'mdi:form-textbox',
            ],
            [
                'slug' => 'textarea',
                'label' => 'Zone de texte',
                'component' => 'Textarea',
                'dataType' => 'string',
                'defaultConfiguration' => ['rows' => 3],
                'icon' => 'mdi:form-textarea',
            ],
            [
                'slug' => 'email',
                'label' => 'Email',
                'component' => 'Input',
                'dataType' => 'string',
                'defaultConfiguration' => ['type' => 'email'],
                'presentationType' => 'html',
                'icon' => 'mdi:email',
            ],
            [
                'slug' => 'password',
                'label' => 'Mot de passe',
                'component' => 'Input',
                'dataType' => 'string',
                'defaultConfiguration' => ['type' => 'password'],
                'presentationType' => 'hidden',
                'icon' => 'mdi:form-textbox-password',
            ],
            [
                'slug' => 'integer',
                'label' => 'Nombre entier',
                'component' => 'Input',
                'dataType' => 'integer',
                'defaultConfiguration' => ['type' => 'number', 'step' => 1],
                'icon' => 'mdi:numeric',
            ],
            [
                'slug' => 'decimal',
                'label' => 'Nombre décimal',
                'component' => 'Input',
                'dataType' => 'float',
                'defaultConfiguration' => ['type' => 'number', 'step' => 0.01],
                'icon' => 'mdi:decimal',
            ],
            [
                'slug' => 'date',
                'label' => 'Date',
                'component' => 'Input',
                'dataType' => 'string',
                'defaultConfiguration' => ['type' => 'date'],
                'presentationType' => 'date',
                'icon' => 'mdi:calendar',
            ],
            [
                'slug' => 'time',
                'label' => 'Heure',
                'component' => 'Input',
                'dataType' => 'string',
                'defaultConfiguration' => ['type' => 'time'],
                'presentationType' => 'text',
                'icon' => 'mdi:clock',
            ],
            [
                'slug' => 'datetime',
                'label' => 'Date et Heure',
                'component' => 'Input',
                'dataType' => 'string',
                'defaultConfiguration' => ['type' => 'datetime-local'],
                'presentationType' => 'datetime',
                'icon' => 'mdi:calendar-clock',
            ],
            [
                'slug' => 'boolean',
                'label' => 'Case à cocher',
                'component' => 'Checkbox',
                'dataType' => 'boolean',
                'defaultConfiguration' => [],
                'presentationType' => 'bool',
                'icon' => 'mdi:checkbox-marked',
            ],
            [
                'slug' => 'select',
                'label' => 'Liste déroulante',
                'component' => 'Select',
                'dataType' => 'string',
                'defaultConfiguration' => ['multiple' => false],
                'icon' => 'mdi:form-dropdown',
            ],
            [
                'slug' => 'radio',
                'label' => 'Boutons radio',
                'component' => 'RadioGroup',
                'dataType' => 'string',
                'defaultConfiguration' => [],
                'icon' => 'mdi:radiobox-marked',
            ],
            [
                'slug' => 'range',
                'label' => 'Curseur',
                'component' => 'Input',
                'dataType' => 'integer',
                'defaultConfiguration' => ['type' => 'range'],
                'icon' => 'mdi:tune',
            ],
            [
                'slug' => 'color',
                'label' => 'Couleur',
                'component' => 'Input',
                'dataType' => 'string',
                'defaultConfiguration' => ['type' => 'color'],
                'presentationType' => 'html',
                'icon' => 'mdi:palette',
            ],
            [
                'slug' => 'phone',
                'label' => 'Téléphone',
                'component' => 'Input',
                'dataType' => 'string',
                'defaultConfiguration' => ['type' => 'tel'],
                'presentationType' => 'text',
                'icon' => 'mdi:phone',
            ],
            [
                'slug' => 'url',
                'label' => 'URL',
                'component' => 'Input',
                'dataType' => 'string',
                'defaultConfiguration' => ['type' => 'url'],
                'presentationType' => 'html',
                'icon' => 'mdi:link',
            ],
        ];

        foreach ($fieldTypes as $fieldTypeData) {
            $fieldType = new FieldType();
            $fieldType->slug = $fieldTypeData['slug'];
            $fieldType->label = $fieldTypeData['label'];
            $fieldType->component = $fieldTypeData['component'];
            $fieldType->dataType = $fieldTypeData['dataType'];
            $fieldType->defaultConfiguration = $fieldTypeData['defaultConfiguration'];
            $fieldType->icon = $fieldTypeData['icon'];
            
            $fieldType->presentationType = $fieldTypeData['presentationType'] ?? 'text';
            $fieldType->assets = $fieldTypeData['assets'] ?? [];
            $fieldType->configurationSchema = $fieldTypeData['configurationSchema'] ?? [];
            $fieldType->presentationConfiguration = $fieldTypeData['presentationConfiguration'] ?? [];

            $manager->persist($fieldType);
        }

        $manager->flush();
    }
}
