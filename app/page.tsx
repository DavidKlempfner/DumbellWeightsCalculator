'use client';

import { useState, useMemo } from 'react';

export default function Home() {
  const [availableWeightsInput, setAvailableWeightsInput] = useState('1, 1.25, 2, 2.5');
  const [currentWeightsInput, setCurrentWeightsInput] = useState('2.5, 1');
  const [results, setResults] = useState<any[]>([]); // Array to store multiple options
  const [error, setError] = useState('');
  const [isIncreaseMode, setIsIncreaseMode] = useState(true);

  const findSmallestChange = (currentPlatesStr: string, availablePlatesStr: string, mode: 'increase' | 'decrease') => {
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
      setResults([]);
      return;
    }

    const generateAllSums = (plates: number[]) => {
      let results = [{ sum: 0, plates: [] as number[] }];
      for (const plate of plates) {
        const nextResults = [...results];
        for (const res of results) {
          nextResults.push({
            sum: Number((res.sum + plate).toFixed(2)), // Fix JS floating point issues
            plates: [...res.plates, plate].sort((a, b) => b - a)
          });
        }
        results = nextResults;
      }
      return results;
    };

    const possibleAdditions = generateAllSums(availablePlates);
    const possibleRemovals = generateAllSums(currentPlates);

    let bestAbsDelta = Infinity;
    let validOptions: any[] = [];

    for (const add of possibleAdditions) {
      for (const remove of possibleRemovals) {
        const netChange = Number((add.sum - remove.sum).toFixed(2));
        const isValid = mode === 'increase' ? netChange > 0 : netChange < 0;
        
        if (isValid) {
          const currentAbsDelta = Math.abs(netChange);
          if (currentAbsDelta < bestAbsDelta) {
            bestAbsDelta = currentAbsDelta;
            validOptions = [{ add: add.plates, remove: remove.plates, change: netChange }];
          } else if (currentAbsDelta === bestAbsDelta) {
            validOptions.push({ add: add.plates, remove: remove.plates, change: netChange });
          }
        }
      }
    }

    // Filter out duplicates (same sets of plates used in different permutations)
    const uniqueOptions = Array.from(new Set(validOptions.map(o => JSON.stringify({
      add: o.add.sort((a: number, b: number) => a - b),
      remove: o.remove.sort((a: number, b: number) => a - b)
    })))).map(s => JSON.parse(s));

    if (uniqueOptions.length === 0) {
      setError(`No valid weight ${mode} is possible with the given plates.`);
      setResults([]);
    } else {
      setResults(uniqueOptions.map(o => ({ ...o, change: mode === 'increase' ? bestAbsDelta : -bestAbsDelta, mode })));
      setError('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans antialiased">
      <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Dumbbell Weight Optimizer</h1>
        
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Plate Weights</label>
            <input
              type="text"
              value={availableWeightsInput}
              onChange={(e) => setAvailableWeightsInput(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Plates on One Side</label>
            <input
              type="text"
              value={currentWeightsInput}
              onChange={(e) => setCurrentWeightsInput(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border"
            />
          </div>

          <button
            onClick={() => findSmallestChange(currentWeightsInput, availableWeightsInput, isIncreaseMode ? 'increase' : 'decrease')}
            className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-md shadow-lg hover:bg-indigo-700 transition-colors"
          >
            Find Smallest Change
          </button>
        </div>

        <div className="mt-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">{error}</div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Results</h2>
              <div className={`p-4 rounded-md shadow-inner border ${results[0].mode === 'increase' ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'}`}>
                <p className={`font-semibold text-lg ${results[0].mode === 'increase' ? 'text-green-700' : 'text-red-700'}`}>
                  Smallest Total Weight {results[0].mode === 'increase' ? 'Increase' : 'Decrease'} Per Side: <span className="font-bold">{Math.abs(results[0].change).toFixed(2)} kg</span>
                </p>
              </div>

              {results.map((opt, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md shadow-inner border border-gray-200">
                  <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-2">Option {index + 1}</h3>
                  {opt.remove.length > 0 && (
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-red-500">Remove:</span>
                      <span className="text-gray-600">{opt.remove.map((p: number) => `${p}kg`).join(', ')}</span>
                    </div>
                  )}
                  {opt.add.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-green-500">Add:</span>
                      <span className="text-gray-600">{opt.add.map((p: number) => `${p}kg`).join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}