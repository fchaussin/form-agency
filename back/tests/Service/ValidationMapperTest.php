<?php

namespace App\Tests\Service;

use App\Service\ValidationMapper;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\Constraints as Assert;

class ValidationMapperTest extends TestCase
{
    private ValidationMapper $mapper;

    protected function setUp(): void
    {
        $this->mapper = new ValidationMapper();
    }

    public function testMapRulesRequired(): void
    {
        $rules = ['required' => true];
        $constraints = $this->mapper->mapRules($rules);

        $this->assertCount(1, $constraints);
        $this->assertInstanceOf(Assert\NotBlank::class, $constraints[0]);
    }

    public function testMapRulesEmail(): void
    {
        $rules = ['email' => true];
        $constraints = $this->mapper->mapRules($rules);

        $this->assertCount(1, $constraints);
        $this->assertInstanceOf(Assert\Email::class, $constraints[0]);
    }

    public function testMapRulesMin(): void
    {
        $rules = ['min' => 10];
        $constraints = $this->mapper->mapRules($rules);

        $this->assertCount(1, $constraints);
        $this->assertInstanceOf(Assert\GreaterThanOrEqual::class, $constraints[0]);
        $this->assertEquals(10, $constraints[0]->value);
    }

    public function testMapRulesMax(): void
    {
        $rules = ['max' => 100];
        $constraints = $this->mapper->mapRules($rules);

        $this->assertCount(1, $constraints);
        $this->assertInstanceOf(Assert\LessThanOrEqual::class, $constraints[0]);
        $this->assertEquals(100, $constraints[0]->value);
    }

    public function testMapRulesCombined(): void
    {
        $rules = ['required' => true, 'email' => true];
        $constraints = $this->mapper->mapRules($rules);

        $this->assertCount(2, $constraints);
        $this->assertInstanceOf(Assert\NotBlank::class, $constraints[0]);
        $this->assertInstanceOf(Assert\Email::class, $constraints[1]);
    }

    public function testMapRulesEmpty(): void
    {
        $rules = [];
        $constraints = $this->mapper->mapRules($rules);

        $this->assertCount(0, $constraints);
    }
}
