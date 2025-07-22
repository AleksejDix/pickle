import { createTemporal } from '../src/core/createTemporal.js';
import { nativeAdapter } from '../src/adapters/native.js';
import useYear from '../src/composables/useYear.js';
import useMonth from '../src/composables/useMonth.js';

console.log('Starting memory leak investigation...');

// Test 1: Create a simple temporal instance
console.log('\nTest 1: Creating temporal instance');
const temporal = createTemporal({
  date: new Date(2024, 0, 15),
  dateAdapter: nativeAdapter
});
console.log('✓ Temporal instance created');

// Test 2: Create a year composable
console.log('\nTest 2: Creating year composable');
const year = useYear({
  now: new Date(2024, 0, 15),
  browsing: new Date(2024, 0, 15),
  adapter: nativeAdapter
});
console.log('✓ Year composable created');

// Test 3: Try to divide - this should cause the issue
console.log('\nTest 3: Testing divide function');
try {
  console.log('Calling temporal.divide(year, "month")...');
  const months = temporal.divide(year, 'month');
  console.log(`✓ Divide completed, got ${months.length} months`);
} catch (error) {
  console.error('✗ Error in divide:', error);
}

console.log('\nInvestigation complete');