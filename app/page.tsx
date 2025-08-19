'use client';

import { useState, useMemo } from 'react';

export default function Home() {
  const [availableWeightsInput, setAvailableWeightsInput] = useState('1, 1.25, 2, 2.5');
  const [currentWeightsInput, setCurrentWeightsInput] = useState('2.5, 1.25, 1.25');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // The core logic to find the smallest weight increase.
  const findSmallestIncrease = (currentPlatesStr: string, availablePlatesStr: string) => {
    // Helper function to parse a comma-separated string of weights into a number array.
    const parseWeights = (weightsStr: string) => {
      return weightsStr
        .split(',')
        .map(s => parseFloat(s.trim()))
        .filter(n => !isNaN(n) && n > 0);
    };

    const currentPlates = parseWeights(currentPlatesStr);
    const availablePlates = parseWeights(availablePlatesStr);

    if (currentPlates.length === 0 || availablePlates.length === 0) {
      setError("Please enter valid weights for both current and available plates.");
      return;
    }

    // Helper function to generate all possible sums from a given list of plates.
    const generateAllSums = (plates: number[]): { sum: number; plates: number[] }[] => {
      const results = [{ sum: 0, plates: [] as number[] }];
      for (let i = 0; i < plates.length; i++) {
        const plate = plates[i];
        const newResults = [];
        for (const result of results) {
          const newPlates = [...result.plates, plate];
          newResults.push({ sum: result.sum + plate, plates: newPlates });
        }
        results.push(...newResults);
      }
      return results;
    };

    // Get all possible sums for plates to add and remove.
    const possibleAdditions = generateAllSums(availablePlates);
    const possibleRemovals = generateAllSums(currentPlates);

    let smallestIncrease = Infinity;
    let bestAddition: number[] = [];
    let bestRemoval: number[] = [];

    // Find the smallest positive increase by comparing all possible additions and removals.
    for (const add of possibleAdditions) {
      for (const remove of possibleRemovals) {
        const netChange = add.sum - remove.sum;
        if (netChange > 0 && netChange < smallestIncrease) {
          smallestIncrease = netChange;
          bestAddition = add.plates;
          bestRemoval = remove.plates;
        }
      }
    }

    // Check if a positive increase was found.
    if (smallestIncrease === Infinity) {
      setError("No positive weight increase is possible with the given plates.");
      setResult(null);
      return;
    }

    // Sort the plates for a clean, readable output.
    bestAddition.sort((a, b) => a - b);
    bestRemoval.sort((a, b) => a - b);

    setResult({
      increase: smallestIncrease,
      addPlates: bestAddition,
      removePlates: bestRemoval,
    });
    setError('');
  };

  // The 'useMemo' hook memoizes the result to prevent recalculation on every render.
  const memoizedResult = useMemo(() => result, [result]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans antialiased">
      <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Dumbbell Weight Optimizer</h1>

        <div className="space-y-6">
          {/* Input for available weights */}
          <div>
            <label htmlFor="available-weights" className="block text-sm font-medium text-gray-700 mb-1">
              Available Plate Weights (comma-separated, e.g., 1, 1.25, 2, 2.5)
            </label>
            <input
              type="text"
              id="available-weights"
              value={availableWeightsInput}
              onChange={(e) => setAvailableWeightsInput(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
            />
          </div>

          {/* Input for current weights */}
          <div>
            <label htmlFor="current-weights" className="block text-sm font-medium text-gray-700 mb-1">
              Current Plates on One Side (comma-separated, e.g., 2.5, 1.25)
            </label>
            <input
              type="text"
              id="current-weights"
              value={currentWeightsInput}
              onChange={(e) => setCurrentWeightsInput(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
            />
          </div>

          {/* Calculation button */}
          <button
            onClick={() => findSmallestIncrease(currentWeightsInput, availableWeightsInput)}
            className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-md shadow-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Find Smallest Increase
          </button>
        </div>

        {/* Display results */}
        <div className="mt-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {memoizedResult && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Results</h2>
              <div className="bg-green-100 p-4 rounded-md shadow-inner border border-green-200">
                <p className="font-semibold text-green-700 text-lg">
                  Smallest Total Weight Increase Per Side: <span className="text-green-900">{memoizedResult.increase.toFixed(2)} kg</span>
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md shadow-inner border border-gray-200">
                <h3 className="font-semibold text-gray-800 text-lg mb-2">Instructions Per Side:</h3>
                
                {/* Plates to Remove */}
                {memoizedResult.removePlates.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-red-500">Remove:</span>
                    <span className="text-gray-600">
                      {memoizedResult.removePlates.map((p: any) => `${p}kg`).join(', ')}
                    </span>
                  </div>
                )}
                {/* Plates to Add */}
                {memoizedResult.addPlates.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-green-500">Add:</span>
                    <span className="text-gray-600">
                      {memoizedResult.addPlates.map((p: any) => `${p}kg`).join(', ')}
                    </span>
                  </div>
                )}
                
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
