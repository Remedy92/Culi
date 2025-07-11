'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, Sun, Moon } from 'lucide-react';

export default function StyleGuidePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-lg">
      <div className="max-w-container-full mx-auto space-y-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-2xl">
          <div>
            <h1 className="text-4xl font-bold mb-sm">Culi Design System</h1>
            <p className="text-foreground/70">
              A comprehensive guide to our design tokens and components
            </p>
          </div>
          <Button
            onClick={toggleDarkMode}
            variant="outline"
            size="icon"
            shape="rounded"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        {/* Colors Section */}
        <section className="space-y-lg">
          <h2 className="text-2xl font-semibold">Colors</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            <ColorSwatch name="Primary" className="bg-primary" />
            <ColorSwatch name="Secondary" className="bg-secondary" />
            <ColorSwatch name="Success" className="bg-success" />
            <ColorSwatch name="Warning" className="bg-warning" />
            <ColorSwatch name="Error" className="bg-error" />
            <ColorSwatch name="Info" className="bg-info" />
            <ColorSwatch name="Background" className="bg-background border" />
            <ColorSwatch name="Foreground" className="bg-foreground" />
          </div>
        </section>

        {/* Typography Section */}
        <section className="space-y-lg">
          <h2 className="text-2xl font-semibold">Typography</h2>
          
          <Card>
            <CardContent className="space-y-md pt-lg">
              <p className="text-xs">Extra Small (xs)</p>
              <p className="text-sm">Small (sm)</p>
              <p className="text-base">Base</p>
              <p className="text-lg">Large (lg)</p>
              <p className="text-xl">Extra Large (xl)</p>
              <p className="text-2xl">2x Large (2xl)</p>
              <p className="text-3xl">3x Large (3xl)</p>
            </CardContent>
          </Card>
        </section>

        {/* Spacing Section */}
        <section className="space-y-lg">
          <h2 className="text-2xl font-semibold">Spacing (8-point Grid)</h2>
          
          <Card>
            <CardContent className="space-y-sm pt-lg">
              <SpacingExample size="xs" />
              <SpacingExample size="sm" />
              <SpacingExample size="md" />
              <SpacingExample size="lg" />
              <SpacingExample size="xl" />
              <SpacingExample size="2xl" />
            </CardContent>
          </Card>
        </section>

        {/* Border Radius Section */}
        <section className="space-y-lg">
          <h2 className="text-2xl font-semibold">Border Radius</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            <RadiusExample name="None" className="rounded-none" />
            <RadiusExample name="Minimal" className="rounded-minimal" />
            <RadiusExample name="Small" className="rounded-small" />
            <RadiusExample name="Medium" className="rounded-medium" />
            <RadiusExample name="Large" className="rounded-large" />
            <RadiusExample name="XLarge" className="rounded-xlarge" />
            <RadiusExample name="Full" className="rounded-full" />
          </div>
        </section>

        {/* Buttons Section */}
        <section className="space-y-lg">
          <h2 className="text-2xl font-semibold">Buttons</h2>
          
          <div className="space-y-md">
            {/* Button Variants */}
            <Card>
              <CardHeader>
                <CardTitle>Variants</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-md">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="error">Error</Button>
              </CardContent>
            </Card>

            {/* Button Sizes */}
            <Card>
              <CardHeader>
                <CardTitle>Sizes</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-md">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon"><Check className="h-4 w-4" /></Button>
              </CardContent>
            </Card>

            {/* Button Shapes */}
            <Card>
              <CardHeader>
                <CardTitle>Shapes</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-md">
                <Button shape="pill">Pill Shape</Button>
                <Button shape="rounded">Rounded</Button>
                <Button shape="square">Square</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Cards Section */}
        <section className="space-y-lg">
          <h2 className="text-2xl font-semibold">Cards</h2>
          
          <div className="grid md:grid-cols-3 gap-md">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>With standard shadow and rounding</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is the default card style used throughout the application.</p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>With enhanced shadow</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Use for important content that needs emphasis.</p>
              </CardContent>
            </Card>

            <Card variant="flat">
              <CardHeader>
                <CardTitle>Flat Card</CardTitle>
                <CardDescription>No shadow, border only</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Perfect for dense layouts or nested cards.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="space-y-token-lg">
          <h2 className="text-2xl font-semibold">Inputs</h2>
          
          <Card>
            <CardContent className="space-y-token-md pt-token-lg">
              <div className="space-y-token-sm">
                <label className="text-sm font-medium">Default Input</label>
                <Input placeholder="Enter text..." />
              </div>
              
              <div className="space-y-token-sm">
                <label className="text-sm font-medium">Success State</label>
                <Input variant="success" placeholder="Valid input" />
              </div>
              
              <div className="space-y-token-sm">
                <label className="text-sm font-medium">Error State</label>
                <Input variant="error" placeholder="Invalid input" />
              </div>
              
              <div className="space-y-token-sm">
                <label className="text-sm font-medium">Different Sizes</label>
                <div className="space-y-token-sm">
                  <Input size="sm" placeholder="Small input" />
                  <Input size="default" placeholder="Default input" />
                  <Input size="lg" placeholder="Large input" />
                </div>
              </div>
              
              <div className="space-y-token-sm">
                <label className="text-sm font-medium">Different Shapes</label>
                <div className="space-y-token-sm">
                  <Input rounded="default" placeholder="Full rounded (default)" />
                  <Input rounded="medium" placeholder="Medium rounded" />
                  <Input rounded="small" placeholder="Small rounded" />
                  <Input rounded="none" placeholder="No rounding" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Badges Section */}
        <section className="space-y-token-lg">
          <h2 className="text-2xl font-semibold">Badges</h2>
          
          <Card>
            <CardContent className="flex flex-wrap gap-token-md pt-token-lg">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="outline">Outline</Badge>
            </CardContent>
          </Card>
        </section>

        {/* Shadows Section */}
        <section className="space-y-token-lg">
          <h2 className="text-2xl font-semibold">Shadows</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-token-md">
            <ShadowExample name="XS" className="shadow-token-xs" />
            <ShadowExample name="SM" className="shadow-token-sm" />
            <ShadowExample name="MD" className="shadow-token-md" />
            <ShadowExample name="LG" className="shadow-token-lg" />
            <ShadowExample name="XL" className="shadow-token-xl" />
            <ShadowExample name="2XL" className="shadow-token-2xl" />
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="space-y-token-lg">
          <h2 className="text-2xl font-semibold">Common Use Cases</h2>
          
          <div className="grid md:grid-cols-2 gap-token-lg">
            {/* Menu Item Card */}
            <Card variant="interactive">
              <CardHeader>
                <CardTitle>Menu Item Card</CardTitle>
                <Badge variant="success">Available</Badge>
              </CardHeader>
              <CardContent>
                <p className="mb-token-sm">Grilled Salmon with Herbs</p>
                <p className="text-sm text-foreground/70 mb-token-md">
                  Fresh Atlantic salmon grilled to perfection with a blend of Mediterranean herbs
                </p>
                <div className="flex gap-token-sm">
                  <Badge variant="info">Gluten Free</Badge>
                  <Badge variant="warning">Contains Fish</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-lg font-semibold">$28.00</p>
              </CardFooter>
            </Card>

            {/* AI Processing State */}
            <Card>
              <CardHeader>
                <CardTitle>AI Processing States</CardTitle>
              </CardHeader>
              <CardContent className="space-y-token-md">
                <div className="flex items-center gap-token-sm">
                  <div className="animate-pulse rounded-token-full bg-token-warning h-2 w-2" />
                  <span className="text-sm">Analyzing menu...</span>
                </div>
                <div className="flex items-center gap-token-sm">
                  <Check className="h-4 w-4 text-token-success" />
                  <span className="text-sm">Menu extracted successfully</span>
                </div>
                <div className="flex items-center gap-token-sm">
                  <AlertCircle className="h-4 w-4 text-token-error" />
                  <span className="text-sm">Failed to process image</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

// Helper Components
function ColorSwatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="space-y-token-xs">
      <div className={`h-20 rounded-token-medium ${className}`} />
      <p className="text-sm font-medium">{name}</p>
    </div>
  );
}

function SpacingExample({ size }: { size: string }) {
  return (
    <div className="flex items-center gap-token-md">
      <span className="text-sm font-medium w-12">{size}</span>
      <div className={`h-8 bg-primary/20 rounded-token-small`} style={{ width: `var(--space-${size})` }} />
    </div>
  );
}

function RadiusExample({ name, className }: { name: string; className: string }) {
  return (
    <div className="space-y-token-xs">
      <div className={`h-20 bg-primary/10 border border-primary/20 ${className}`} />
      <p className="text-sm font-medium">{name}</p>
    </div>
  );
}

function ShadowExample({ name, className }: { name: string; className: string }) {
  return (
    <div className="space-y-token-xs">
      <div className={`h-20 bg-background rounded-token-medium border ${className}`} />
      <p className="text-sm font-medium">{name}</p>
    </div>
  );
}