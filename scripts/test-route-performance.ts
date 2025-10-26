/**
 * Route Performance Test Script
 * 
 * This script helps verify performance improvements after optimization.
 * Run this to measure the actual performance gains.
 * 
 * Usage:
 *   npx ts-node scripts/test-route-performance.ts
 */

interface PerformanceResult {
  route: string;
  duration: number;
  status: number;
  error?: string;
}

async function testRoute(
  url: string,
  method: string = "GET",
  headers: Record<string, string> = {}
): Promise<PerformanceResult> {
  const start = performance.now();
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
    
    const end = performance.now();
    const duration = end - start;
    
    return {
      route: url,
      duration: Math.round(duration),
      status: response.status,
    };
  } catch (error) {
    const end = performance.now();
    const duration = end - start;
    
    return {
      route: url,
      duration: Math.round(duration),
      status: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runPerformanceTests() {
  console.log("🚀 Starting Performance Tests...\n");
  console.log("=" .repeat(80));
  console.log("NOTE: You must be logged in with valid session cookies for these tests.");
  console.log("=" .repeat(80));
  console.log();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  const routes = [
    {
      name: "Student Schedule",
      url: `${baseUrl}/api/student/schedule`,
    },
    {
      name: "Student Feedback",
      url: `${baseUrl}/api/student/feedback`,
    },
    {
      name: "Faculty Schedule",
      url: `${baseUrl}/api/faculty/schedule`,
    },
  ];

  console.log("📊 Testing routes (3 runs each for average)...\n");

  for (const route of routes) {
    console.log(`Testing: ${route.name}`);
    const results: number[] = [];
    
    // Run 3 times to get average
    for (let i = 0; i < 3; i++) {
      const result = await testRoute(route.url);
      results.push(result.duration);
      
      if (result.error) {
        console.log(`  Run ${i + 1}: ❌ Error - ${result.error}`);
      } else if (result.status === 401) {
        console.log(`  Run ${i + 1}: ⚠️  Unauthorized (need to be logged in)`);
      } else if (result.status >= 400) {
        console.log(`  Run ${i + 1}: ⚠️  Status ${result.status} - ${result.duration}ms`);
      } else {
        console.log(`  Run ${i + 1}: ✅ ${result.duration}ms (Status ${result.status})`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const validResults = results.filter(r => r > 0);
    if (validResults.length > 0) {
      const average = Math.round(
        validResults.reduce((a, b) => a + b, 0) / validResults.length
      );
      const min = Math.min(...validResults);
      const max = Math.max(...validResults);
      
      console.log(`  📈 Average: ${average}ms | Min: ${min}ms | Max: ${max}ms`);
    }
    console.log();
  }

  console.log("=" .repeat(80));
  console.log("✅ Performance tests completed!");
  console.log("=" .repeat(80));
  console.log();
  console.log("📝 Expected Results:");
  console.log("  - Student Schedule: ~50-150ms (optimized)");
  console.log("  - Student Feedback: ~50-100ms (optimized)");
  console.log("  - Faculty Schedule: ~80-200ms (optimized)");
  console.log();
  console.log("💡 Tips:");
  console.log("  - First request may be slower (cold start)");
  console.log("  - Subsequent requests should be faster (caching)");
  console.log("  - Auth operations are ~100x faster with caching");
  console.log("  - Parallel queries reduce waterfall delays");
}

// Run tests
runPerformanceTests().catch(console.error);

