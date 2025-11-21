<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use ApiPlatform\Validator\Exception\ValidationException;
use App\Entity\FormDefinition;
use App\Entity\Submission;
use App\Service\Renderer\FieldRendererInterface;
use App\Service\ValidationMapper;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\AutowireIterator;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class SubmissionProcessor implements ProcessorInterface
{
    private iterable $renderers;

    public function __construct(
        #[AutowireIterator('app.field_renderer')] iterable $renderers,
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
        private ValidationMapper $validationMapper
    ) {
        $this->renderers = $renderers;
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Submission
    {
        /** @var Submission $submission */
        $submission = $data;
        
        // 1. Récupération du formulaire lié
        if (!$submission->form) {
            throw new NotFoundHttpException('Form definition is missing.');
        }
        
        // 2. Récupération du payload brut (transmis via un champ non mappé ou DTO)
        $rawPayload = $submission->rawPayload ?? [];
        $snapshotData = [];
        $violations = new ConstraintViolationList();

        // 3. Boucle sur les champs définis
        foreach ($submission->form->fields as $field) {
            $value = $rawPayload[$field->name] ?? null;

            // A. Validation Dynamique
            $constraints = $this->validationMapper->mapRules($field->validationRules);
            $fieldViolations = $this->validator->validate($value, $constraints);

            if (count($fieldViolations) > 0) {
                foreach ($fieldViolations as $violation) {
                    $violations->add(new ConstraintViolation(
                        $violation->getMessage(),
                        $violation->getMessageTemplate(),
                        $violation->getParameters(),
                        $submission,
                        $field->name, // Le pointeur d'erreur sera le nom technique du champ
                        $value
                    ));
                }
            }

            // B. Rendu & Snapshot (si pas d'erreur globale bloquante prévue, sinon on peut skip)
            $renderer = $this->getRenderer($field->renderStrategy);
            $renderedValue = $renderer->render($value, $field->renderOptions);

            $snapshotData[$field->name] = [
                'raw_value' => $value,
                'rendered_value' => $renderedValue,
                'component' => $field->component?->libraryName, // Snapshot technique
                'version' => $field->component?->version
            ];
        }

        // 4. Stop si erreurs
        if (count($violations) > 0) {
            throw new ValidationException($violations);
        }

        // 5. Finalisation
        $submission->data = $snapshotData;
        $submission->createdAt = new \DateTimeImmutable();

        $this->em->persist($submission);
        $this->em->flush();

        return $submission;
    }

    private function getRenderer(string $alias): FieldRendererInterface
    {
        foreach ($this->renderers as $renderer) {
            if ($renderer::getAlias() === $alias) {
                return $renderer;
            }
        }
        // Fallback simple
        return new class implements FieldRendererInterface {
            public function render(mixed $v, array $o): mixed { return $v; }
            public static function getAlias(): string { return 'default'; }
        };
    }
}