/**
 * Carbon Conversion Library
 * Utilities for converting energy metrics to CO2e (tonnes)
 */

// Emission factors (kg CO2e per unit)
export const EMISSION_FACTORS = {
  // Electricity grid (varies by region, using average)
  ELECTRICITY_GRID_US: 0.389, // kg CO2e per kWh
  ELECTRICITY_GRID_AVG: 0.475, // Global average
  
  // Renewable sources (very low)
  SOLAR: 0.048,
  WIND: 0.011,
  HYDRO: 0.024,
  
  // Fossil fuels
  COAL: 820, // kg CO2e per MWh
  NATURAL_GAS: 350, // kg CO2e per MWh
  DIESEL: 2.68, // kg CO2e per liter
};

/**
 * Convert kWh to tonnes CO2e
 */
export function kWhToTonnesCO2e(
  kWh: number,
  source: keyof typeof EMISSION_FACTORS = 'ELECTRICITY_GRID_AVG'
): number {
  const factor = EMISSION_FACTORS[source];
  // Convert kg to tonnes: divide by 1000
  return (kWh * factor) / 1000;
}

/**
 * Convert MWh to tonnes CO2e
 */
export function MWhToTonnesCO2e(
  MWh: number,
  source: keyof typeof EMISSION_FACTORS = 'ELECTRICITY_GRID_AVG'
): number {
  return kWhToTonnesCO2e(MWh * 1000, source);
}

/**
 * Generate daily digest data for IoT simulation
 */
export function generateDailyDigest(projectType: string): {
  date: string;
  energyGenerated: number; // kWh
  creditsEarned: number; // tonnes CO2e
  hash: string;
} {
  const date = new Date();
  date.setDate(date.getDate() - 1); // Yesterday
  
  // Simulate energy generation (varies by project type)
  const baseGeneration: Record<string, number> = {
    SOLAR: 5000, // kWh/day
    WIND: 15000, // kWh/day
    HYDRO: 20000, // kWh/day
    RENEWABLE_ENERGY: 10000,
  };
  
  const energyGenerated = (baseGeneration[projectType] || 8000) + 
    Math.random() * 2000 - 1000; // ±1000 variance
  
  // Convert to credits
  const emissionFactor = projectType === 'SOLAR' ? EMISSION_FACTORS.ELECTRICITY_GRID_AVG : 
                        projectType === 'WIND' ? EMISSION_FACTORS.ELECTRICITY_GRID_AVG : 
                        EMISSION_FACTORS.ELECTRICITY_GRID_AVG;
  
  const creditsEarned = kWhToTonnesCO2e(energyGenerated, 'ELECTRICITY_GRID_AVG');
  
  // Generate hash (simplified - in real system, hash the actual data)
  const dataString = `${date.toISOString()}-${energyGenerated}-${creditsEarned}`;
  const hash = btoa(dataString).substring(0, 64); // Using btoa instead of Buffer for browser compatibility
  
  return {
    date: date.toISOString().split('T')[0],
    energyGenerated: Math.round(energyGenerated * 100) / 100,
    creditsEarned: Math.round(creditsEarned * 1000) / 1000,
    hash,
  };
}

/**
 * Calculate total credits from energy data
 */
export function calculateCredits(
  energyData: Array<{ date: string; energyGenerated: number }>,
  source: keyof typeof EMISSION_FACTORS = 'ELECTRICITY_GRID_AVG'
): number {
  const totalKWh = energyData.reduce((sum, d) => sum + d.energyGenerated, 0);
  return kWhToTonnesCO2e(totalKWh, source);
}

