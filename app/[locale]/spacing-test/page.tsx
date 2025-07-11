'use client';

export default function SpacingTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-8">Spacing Test - Fluid vs Fixed</h1>
        
        {/* Fixed Spacing Reference */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Fixed Spacing (Original)</h2>
          <div className="grid gap-4">
            <div className="bg-neutral-100 p-2 rounded">p-2 (8px)</div>
            <div className="bg-neutral-100 p-3 rounded">p-3 (12px)</div>
            <div className="bg-neutral-100 p-4 rounded">p-4 (16px)</div>
            <div className="bg-neutral-100 p-6 rounded">p-6 (24px)</div>
            <div className="bg-neutral-100 p-8 rounded">p-8 (32px)</div>
          </div>
        </section>

        {/* Fluid Spacing */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Fluid Spacing (New)</h2>
          <div className="grid gap-4">
            <div className="bg-primary/10 p-xs rounded">p-xs (4-8px)</div>
            <div className="bg-primary/10 p-sm rounded">p-sm (8-12px)</div>
            <div className="bg-primary/10 p-md rounded">p-md (12-16px)</div>
            <div className="bg-primary/10 p-lg rounded">p-lg (16-24px)</div>
            <div className="bg-primary/10 p-xl rounded">p-xl (24-32px)</div>
          </div>
        </section>

        {/* Side by Side Comparison */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Side by Side Comparison</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Fixed (p-4)</h3>
              <div className="bg-neutral-100 p-4 rounded">
                <div className="bg-white p-4 rounded">Nested p-4</div>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Fluid (p-md)</h3>
              <div className="bg-primary/10 p-md rounded">
                <div className="bg-white p-md rounded">Nested p-md</div>
              </div>
            </div>
          </div>
        </section>

        {/* Gap Testing */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Gap Testing</h2>
          <div className="flex gap-4 flex-wrap">
            <div className="bg-neutral-100 p-4 rounded">gap-4</div>
            <div className="bg-neutral-100 p-4 rounded">gap-4</div>
            <div className="bg-neutral-100 p-4 rounded">gap-4</div>
          </div>
          <div className="flex gap-md flex-wrap mt-4">
            <div className="bg-primary/10 p-md rounded">gap-md</div>
            <div className="bg-primary/10 p-md rounded">gap-md</div>
            <div className="bg-primary/10 p-md rounded">gap-md</div>
          </div>
        </section>

        {/* Touch Target Test */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Touch Targets (min 44px)</h2>
          <div className="flex gap-4">
            <button className="bg-primary text-white px-4 py-2 rounded-full min-h-[44px]">
              Fixed Button
            </button>
            <button className="bg-primary text-white px-md py-sm rounded-full min-h-[44px]">
              Fluid Button
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}