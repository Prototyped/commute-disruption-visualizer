/**
 * Main entry point for the TypeScript application
 */

import { greet } from './utils/greeting';
import { Calculator } from './utils/calculator';

function main(): void {
  console.log(greet('TypeScript Build System'));
  
  const calc = new Calculator();
  const result = calc.add(5, 3);
  console.log(`5 + 3 = ${result}`);
}

// Run the application
if (require.main === module) {
  main();
}

export { main };