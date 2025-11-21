<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ApiResource(
    operations: [
        new Post(processor: SubmissionProcessor::class)
    ]
)]
class Submission
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    public ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    public ?FormDefinition $form = null;

    #[ORM\Column(type: 'json')]
    public array $data = [];

    #[ORM\Column]
    public ?\DateTimeImmutable $createdAt = null;

    public ?array $rawPayload = null;
}