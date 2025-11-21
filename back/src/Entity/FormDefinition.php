<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ApiResource]
class FormDefinition
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    public ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    public ?Consumer $consumer = null;

    #[ORM\Column(length: 255, unique: true)]
    public ?string $code = null;

    #[ORM\OneToMany(mappedBy: 'form', targetEntity: FieldInstance::class, cascade: ['persist', 'remove'])]
    #[ORM\OrderBy(['position' => 'ASC'])]
    public Collection $fields;

    #[ORM\Column(length: 255, nullable: true)]
    public ?string $webhookUrl = null;

    public function __construct()
    {
        $this->fields = new ArrayCollection();
    }
}
