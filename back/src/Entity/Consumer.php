<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity]
#[ApiResource]
class Consumer implements UserInterface
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    public ?int $id = null;

    #[ORM\Column(length: 255)]
    public ?string $name = null;

    #[ORM\Column(length: 255, unique: true)]
    public ?string $apiKey = null;

    #[ORM\Column(length: 255)]
    public ?string $contactEmail = null;

    #[ORM\Column(type: 'json')]
    public array $allowedOrigins = [];

    public function getRoles(): array
    {
        return ['ROLE_CONSUMER'];
    }

    public function eraseCredentials(): void {}

    public function getUserIdentifier(): string
    {
        return $this->apiKey;
    }
}
