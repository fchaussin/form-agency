<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ApiResource]
class FieldInstance
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    public ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'fields')]
    #[ORM\JoinColumn(nullable: false)]
    public ?FormDefinition $form = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    public ?FieldType $component = null;

    #[ORM\Column(length: 255)]
    public ?string $name = null;

    #[ORM\Column(length: 255)]
    public ?string $label = null;

    #[ORM\Column]
    public int $position = 0;

    #[ORM\Column(type: 'json')]
    public array $validationRules = [];

    #[ORM\Column(type: 'json')]
    public array $uiOptions = [];

    #[ORM\Column(length: 50)]
    public ?string $renderStrategy = 'default';

    #[ORM\Column(type: 'json')]
    public array $renderOptions = [];
}