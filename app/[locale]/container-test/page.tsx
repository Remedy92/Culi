'use client';

export default function ContainerTestPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="space-y-12">
        <h1 className="text-3xl font-bold text-center mb-8">Container Width Test</h1>
        
        {/* Old vs New Comparison */}
        <section className="space-y-8">
          <h2 className="text-xl font-semibold text-center">Before vs After Container Widths</h2>
          
          {/* Old narrow widths */}
          <div className="bg-red-50 py-8">
            <h3 className="text-center mb-4 text-red-700">OLD: Narrow Containers</h3>
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm mb-4">
              <p className="text-sm text-gray-600 mb-2">max-w-2xl (32rem = 512px)</p>
              <p>This was causing the "giant column" issue - too narrow for modern screens!</p>
            </div>
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-2">max-w-4xl (56rem = 896px)</p>
              <p>Even the "wider" containers were still quite narrow.</p>
            </div>
          </div>
          
          {/* New responsive widths */}
          <div className="bg-green-50 py-8">
            <h3 className="text-center mb-4 text-green-700">NEW: Properly Sized Containers</h3>
            <div className="max-w-container-prose mx-auto bg-white p-6 rounded-lg shadow-sm mb-4">
              <p className="text-sm text-gray-600 mb-2">max-w-container-prose (65ch ≈ 650px)</p>
              <p>Optimal reading width for body text and articles. Still comfortable but not too narrow.</p>
            </div>
            <div className="max-w-container-narrow mx-auto bg-white p-6 rounded-lg shadow-sm mb-4">
              <p className="text-sm text-gray-600 mb-2">max-w-container-narrow (48rem = 768px)</p>
              <p>Perfect for forms, cards, and focused content areas.</p>
            </div>
            <div className="max-w-container-standard mx-auto bg-white p-6 rounded-lg shadow-sm mb-4">
              <p className="text-sm text-gray-600 mb-2">max-w-container-standard (64rem = 1024px)</p>
              <p>Standard content width for main sections - much more breathing room!</p>
            </div>
            <div className="max-w-container-wide mx-auto bg-white p-6 rounded-lg shadow-sm mb-4">
              <p className="text-sm text-gray-600 mb-2">max-w-container-wide (80rem = 1280px)</p>
              <p>Wide layouts for dashboards, galleries, and data-rich interfaces.</p>
            </div>
            <div className="max-w-container-full mx-auto bg-white p-6 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-2">max-w-container-full (96rem = 1536px)</p>
              <p>Full-width hero sections that utilize modern wide screens effectively!</p>
            </div>
          </div>
        </section>
        
        {/* Visual comparison side by side */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-center">Visual Impact</h2>
          <div className="text-center text-sm text-gray-600 mb-4">
            Resize your browser window to see how containers adapt
          </div>
          
          <div className="space-y-8">
            <div>
              <p className="text-center mb-2 text-red-600">Old Hero (max-w-7xl = 80rem = 1280px)</p>
              <div className="max-w-7xl mx-auto bg-red-100 p-8 rounded-lg">
                <div className="max-w-2xl mx-auto bg-red-200 p-4 rounded">
                  Text content was limited to max-w-2xl (512px) - way too narrow!
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-center mb-2 text-green-600">New Hero (max-w-container-full = 96rem = 1536px)</p>
              <div className="max-w-container-full mx-auto bg-green-100 p-8 rounded-lg">
                <div className="max-w-container-wide mx-auto bg-green-200 p-4 rounded">
                  Text content now uses responsive container widths - much better use of space!
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Responsive behavior */}
        <section className="max-w-container-full mx-auto px-4">
          <h2 className="text-xl font-semibold text-center mb-4">Responsive Behavior</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-neutral-100 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Mobile First</h3>
              <p className="text-sm">All containers are fluid on mobile, respecting padding while maximizing content width.</p>
            </div>
            <div className="bg-neutral-100 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Desktop Optimized</h3>
              <p className="text-sm">On larger screens, containers provide appropriate max-widths to maintain readability and visual hierarchy.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}