<?php

namespace App\DataFixtures;

use App\Entity\Consumer;
use App\Entity\FieldInstance;
use App\Entity\FieldType;
use App\Entity\FormDefinition;
use App\Entity\Submission;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\Uid\Uuid;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void{}
}
