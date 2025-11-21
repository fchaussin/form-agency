<?php

namespace App\Tests\State;

use App\Entity\Consumer;
use App\Entity\FieldInstance;
use App\Entity\FieldType;
use App\Entity\FormDefinition;
use App\Entity\Submission;
use App\Service\Renderer\FieldRendererInterface;
use App\Service\ValidationMapper;
use App\State\SubmissionProcessor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use ApiPlatform\Validator\Exception\ValidationException;

class TestDefaultRenderer implements FieldRendererInterface
{
    public function render(mixed $value, array $options): mixed
    {
        return $value;
    }

    public static function getAlias(): string
    {
        return 'default';
    }
}

class SubmissionProcessorTest extends KernelTestCase
{
    private SubmissionProcessor $processor;
    private EntityManagerInterface $em;
    private ValidatorInterface $validator;
    private ValidationMapper $validationMapper;
    private $renderers;

    protected function setUp(): void
    {
        self::bootKernel();
        $this->em = $this->createMock(EntityManagerInterface::class);
        $this->validator = $this->createMock(ValidatorInterface::class);
        $this->validationMapper = $this->createMock(ValidationMapper::class);

        $this->renderers = [new TestDefaultRenderer()];

        $this->processor = new SubmissionProcessor(
            $this->renderers,
            $this->em,
            $this->validator,
            $this->validationMapper
        );
    }

    public function testProcessSuccessfulSubmission(): void
    {
        // Arrange
        $formDefinition = new FormDefinition();
        $field = new FieldInstance();
        $field->name = 'email';
        $field->type = 'email';
        $field->validationRules = ['required' => true, 'email' => true];
        $field->renderStrategy = 'default';
        $field->component = null;
        $formDefinition->fields = new ArrayCollection([$field]);

        $submission = new Submission();
        $submission->form = $formDefinition;
        $submission->rawPayload = ['email' => 'test@example.com'];

        $this->validationMapper->method('mapRules')->willReturn([]);
        $this->validator->method('validate')->willReturn(new ConstraintViolationList());
        $this->em->expects($this->once())->method('persist')->with($submission);
        $this->em->expects($this->once())->method('flush');

        // Act
        $result = $this->processor->process($submission, new \ApiPlatform\Metadata\Post());

        // Assert
        $this->assertInstanceOf(Submission::class, $result);
        $this->assertArrayHasKey('email', $result->data);
        $this->assertEquals('test@example.com', $result->data['email']['raw_value']);
        $this->assertNull($result->data['email']['component']);
    }

    public function testProcessSubmissionWithValidationError(): void
    {
        // Assert
        $this->expectException(ValidationException::class);

        // Arrange
        $formDefinition = new FormDefinition();
        $field = new FieldInstance();
        $field->name = 'email';
        $field->type = 'email';
        $field->validationRules = ['required' => true, 'email' => true];
        $field->renderStrategy = 'default';
        $field->component = null;
        $formDefinition->fields = new ArrayCollection([$field]);

        $submission = new Submission();
        $submission->form = $formDefinition;
        $submission->rawPayload = ['email' => 'not-an-email'];

        $violations = new ConstraintViolationList([
            new ConstraintViolation('Invalid email', '', [], '', 'email', 'not-an-email')
        ]);
        $this->validationMapper->method('mapRules')->willReturn([]);
        $this->validator->method('validate')->willReturn($violations);

        // Act
        $this->processor->process($submission, new \ApiPlatform\Metadata\Post());
    }
}
