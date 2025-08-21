'use client';

import { useState, useMemo } from 'react';

export default function Home() {
  const [availableWeightsInput, setAvailableWeightsInput] = useState('1, 1.25, 2, 2.5');
  const [currentWeightsInput, setCurrentWeightsInput] = useState('2.5, 1.25, 1.25');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isIncreaseMode, setIsIncreaseMode] = useState(true); // New state for the slider

  const findSmallestChange = (currentPlatesStr: string, availablePlatesStr: string, mode: 'increase' | 'decrease') => {
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
      setResult(null);
      return;
    }

    // Helper function to generate all possible sums from a given list of plates.
    const generateAllSums = (plates: number[]): { sum: number; plates: number[] }[] => {
      const results = [{ sum: 0, plates: [] as number[] }];
      const uniquePlates = Array.from(new Set(plates));
      for (const plate of uniquePlates) {
        const newResults = [];
        for (const result of results) {
          const newPlates = [...result.plates, plate];
          newResults.push({ sum: result.sum + plate, plates: newPlates });
        }
        results.push(...newResults);
      }
      return results;
    };

    const possibleAdditions = generateAllSums(availablePlates);
    const possibleRemovals = generateAllSums(currentPlates);

    let bestChange = Infinity;
    let bestAddition: number[] = [];
    let bestRemoval: number[] = [];

    // The logic to find the smallest change (positive for increase, negative for decrease).
    for (const add of possibleAdditions) {
      for (const remove of possibleRemovals) {
        const netChange = add.sum - remove.sum;

        if (mode === 'increase' && netChange > 0 && netChange < bestChange) {
          bestChange = netChange;
          bestAddition = add.plates;
          bestRemoval = remove.plates;
        } else if (mode === 'decrease' && netChange < 0 && Math.abs(netChange) < Math.abs(bestChange)) {
          bestChange = netChange;
          bestAddition = add.plates;
          bestRemoval = remove.plates;
        }
      }
    }

    // Check if a valid change was found.
    const isChangeFound = mode === 'increase' ? bestChange !== Infinity : bestChange !== Infinity;
    if (!isChangeFound) {
      setError(`No valid weight ${mode} is possible with the given plates.`);
      setResult(null);
      return;
    }

    // Sort the plates for a clean, readable output.
    bestAddition.sort((a, b) => a - b);
    bestRemoval.sort((a, b) => a - b);

    setResult({
      change: bestChange,
      addPlates: bestAddition,
      removePlates: bestRemoval,
      mode: mode,
    });
    setError('');
  };

  const memoizedResult = useMemo(() => result, [result]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans antialiased">
      <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Dumbbell Weight Optimizer</h1>
        
        {/* Toggle Switch */}
        <div className="flex justify-center items-center space-x-4 mb-6">
          <span className="text-gray-600">Decrease Weight</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isIncreaseMode}
              onChange={() => setIsIncreaseMode(!isIncreaseMode)}
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-gray-600">Increase Weight</span>
        </div>

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
            onClick={() => findSmallestChange(currentWeightsInput, availableWeightsInput, isIncreaseMode ? 'increase' : 'decrease')}
            className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-md shadow-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Find Smallest Change
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
              <div className={`p-4 rounded-md shadow-inner border ${memoizedResult.mode === 'increase' ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'}`}>
                <p className={`font-semibold text-lg ${memoizedResult.mode === 'increase' ? 'text-green-700' : 'text-red-700'}`}>
                  Smallest Total Weight {memoizedResult.mode === 'increase' ? 'Increase' : 'Decrease'} Per Side: <span className={`${memoizedResult.mode === 'increase' ? 'text-green-900' : 'text-red-900'}`}>{Math.abs(memoizedResult.change).toFixed(2)} kg</span>
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