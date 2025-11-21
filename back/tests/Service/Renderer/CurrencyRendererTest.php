<?php

namespace App\Tests\Service\Renderer;

use App\Service\Renderer\CurrencyRenderer;
use PHPUnit\Framework\TestCase;

class CurrencyRendererTest extends TestCase
{
    private CurrencyRenderer $renderer;

    protected function setUp(): void
    {
        $this->renderer = new CurrencyRenderer();
    }

    public function testRenderWithDefaultCurrency(): void
    {
        $renderedValue = $this->renderer->render(1234.56, []);
        $this->assertEquals('1 234,56 EUR', $renderedValue);
    }

    public function testRenderWithUsdCurrency(): void
    {
        $renderedValue = $this->renderer->render(1234.56, ['currency' => 'USD']);
        $this->assertEquals('1 234,56 USD', $renderedValue);
    }

    public function testRenderWithIntegerValue(): void
    {
        $renderedValue = $this->renderer->render(1234, []);
        $this->assertEquals('1 234,00 EUR', $renderedValue);
    }
    
    public function testRenderWithNonNumericValue(): void
    {
        $renderedValue = $this->renderer->render('not a number', []);
        $this->assertEquals('not a number', $renderedValue);
    }

    public function testGetAlias(): void
    {
        $this->assertEquals('currency', CurrencyRenderer::getAlias());
    }
}
