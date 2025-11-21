<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ApiResource(
    operations: [
        new Get(),
        new GetCollection(),
        new Post(),
        new Put(),
        new Delete(),
    ],
    normalizationContext: ['groups' => ['field_type:read']],
    denormalizationContext: ['groups' => ['field_type:write']],
)]
class FieldType
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    #[Groups(['field_type:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 50, unique: true)]
    #[Groups(['field_type:read', 'field_type:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(max: 50)]
    public ?string $slug = null;

    #[ORM\Column(length: 100)]
    #[Groups(['field_type:read', 'field_type:write'])]
    #[Assert\NotBlank]
    public ?string $label = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['field_type:read', 'field_type:write'])]
    public ?string $icon = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['field_type:read', 'field_type:write'])]
    public ?string $description = null;

    #[ORM\Column(length: 20)]
    #[Groups(['field_type:read', 'field_type:write'])]
    #[Assert\NotBlank]
    #[Assert\Choice(['string', 'integer', 'float', 'boolean', 'array', 'json', 'date_time'])]
    public string $dataType = 'string';

    #[ORM\Column(length: 50)]
    #[Groups(['field_type:read', 'field_type:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(max: 50)]
    public string $component;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['field_type:read', 'field_type:write'])]
    public ?array $assets = [];

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['field_type:read', 'field_type:write'])]
    public ?string $initHook = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['field_type:read', 'field_type:write'])]
    public array $configurationSchema = [];

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['field_type:read', 'field_type:write'])]
    public array $defaultConfiguration = [];

    #[ORM\Column(length: 20)]
    #[Groups(['field_type:read', 'field_type:write'])]
    #[Assert\NotBlank]
    #[Assert\Choice(['text', 'html', 'date', 'datetime', 'bool', 'image', 'file', 'hidden'])]
    public string $presentationType = 'text';

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['field_type:read', 'field_type:write'])]
    public array $presentationConfiguration = [];

    public function getId(): ?int
    {
        return $this->id;
    }
}