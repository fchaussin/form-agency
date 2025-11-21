<?php

namespace App\Tests\Security;

use App\Entity\Consumer;
use App\Security\ApiKeyAuthenticator;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class ApiKeyAuthenticatorTest extends KernelTestCase
{
    private ApiKeyAuthenticator $authenticator;
    private EntityManagerInterface $em;
    private EntityRepository $repository;

    protected function setUp(): void
    {
        self::bootKernel();
        $this->repository = $this->createMock(EntityRepository::class);
        $this->em = $this->createMock(EntityManagerInterface::class);
        $this->em->method('getRepository')->with(Consumer::class)->willReturn($this->repository);

        $this->authenticator = new ApiKeyAuthenticator($this->em);
    }

    public function testSupports(): void
    {
        $request = new Request([], [], [], [], [], ['HTTP_X-API-KEY' => 'test-key']);
        $this->assertTrue($this->authenticator->supports($request));

        $request = new Request();
        $this->assertFalse($this->authenticator->supports($request));
    }

    public function testAuthenticateWithValidKey(): void
    {
        $consumer = new Consumer();
        $consumer->apiKey = 'test-key';
        $this->repository->method('findOneBy')->with(['apiKey' => 'test-key'])->willReturn($consumer);

        $request = new Request([], [], [], [], [], ['HTTP_X-API-KEY' => 'test-key']);
        $passport = $this->authenticator->authenticate($request);

        $this->assertInstanceOf(SelfValidatingPassport::class, $passport);
    }

    public function testAuthenticateWithInvalidKey(): void
    {
        $this->expectException(AuthenticationException::class);

        $this->repository->method('findOneBy')->with(['apiKey' => 'invalid-key'])->willReturn(null);

        $request = new Request([], [], [], [], [], ['HTTP_X-API-KEY' => 'invalid-key']);
        $this->authenticator->authenticate($request);
    }

    public function testAuthenticateWithNoKey(): void
    {
        $this->expectException(AuthenticationException::class);
        $request = new Request();
        $this->authenticator->authenticate($request);
    }
}
