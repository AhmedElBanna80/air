import { db } from "./index";
import { parameters } from "./schema/parameters";

// Parameter seed data
const parameterData = [
  {
    name: 'co',
    display_name: 'Carbon Monoxide',
    description: 'Carbon monoxide concentration',
    unit: 'mg/m^3',
    min_safe_value: 0,
    max_safe_value: 10
  },
  // ... rest of your data
];

export async function seedParameters() {
  try {
    console.log('Seeding parameters table...');
    await db.insert(parameters).values(parameterData)
      .onConflictDoNothing({ target: parameters.name });
    console.log('Parameters table seeded successfully');
  } catch (error) {
    console.error('Error seeding parameters table:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedParameters()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
} 