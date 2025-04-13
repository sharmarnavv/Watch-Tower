"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Globe, Moon, Sun, Plus, X } from 'lucide-react';
import { useWebsites } from '@/hooks/useWebsites';
import axios from 'axios';
import { API_BACKEND_URL } from '@/config';
import { useAuth } from '@clerk/nextjs';

type WebsiteStatus = 'UP' | 'DOWN' | 'unknown';

function StatusCircle({ status }: { status: WebsiteStatus }) {
  return (
    <div className={`w-3 h-3 rounded-full ${status === 'UP' ? 'bg-green-500' : status === 'DOWN' ? 'bg-red-500' : 'bg-gray-400' }`} />
  );
}

function aggregateTicksToWindows(ticks: Array<{ createdAt: string; status: WebsiteStatus }>) {
  // Create a copy of ticks and ensure they're sorted by date (newest first)
  const sortedTicks = [...ticks]
    .map(tick => ({
      ...tick,
      // Convert string dates to Date objects for accurate comparison
      dateObj: new Date(tick.createdAt)
    }))
    .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

  // console.log('Sorted ticks:', sortedTicks.map(t => ({
  //   date: t.dateObj.toISOString(),
  //   status: t.status
  // })));

  // Create 10 time windows of 3 minutes each, covering the last 30 minutes
  // Use the most recent tick's time as reference, or current time if no ticks
  const referenceTime = sortedTicks.length > 0
    ? new Date(sortedTicks[0].dateObj)
    : new Date();

  // console.log('Reference time for windows:', referenceTime);

  // Round the reference time to the nearest minute to ensure consistent window boundaries
  const roundedReferenceTime = new Date(referenceTime);
  roundedReferenceTime.setSeconds(0);
  roundedReferenceTime.setMilliseconds(0);
  // Add 3 minutes to ensure the most recent tick is included in the first window
  roundedReferenceTime.setMinutes(roundedReferenceTime.getMinutes() + 3);

  // console.log('Rounded reference time:', roundedReferenceTime);

  const windows = [];

  for (let i = 0; i < 10; i++) {
    const windowEnd = new Date(roundedReferenceTime.getTime() - i * 3 * 60 * 1000);
    const windowStart = new Date(windowEnd.getTime() - 3 * 60 * 1000);
    windows.push({
      start: windowStart,
      end: windowEnd,
      color: 'gray' // Default color
    });
  }

  // For debugging
  // console.log('Time windows:', windows.map((w, i) => ({
  //   index: i,
  //   start: w.start.toISOString(),
  //   end: w.end.toISOString()
  // })));

  // Assign ticks to windows
  for (const tick of sortedTicks) {
    const tickTime = tick.dateObj.getTime();
    // console.log(`Processing tick: ${tick.dateObj.toISOString()}, status: ${tick.status}`);

    // Find which window this tick belongs to
    for (let i = 0; i < windows.length; i++) {
      const window = windows[i];
      const windowStartTime = window.start.getTime();
      const windowEndTime = window.end.getTime();

      // console.log(`Checking window ${i}: ${window.start.toISOString()} to ${window.end.toISOString()}`);
      // console.log(`Tick time: ${tickTime}, Window start: ${windowStartTime}, Window end: ${windowEndTime}`);
      // console.log(`Is tick in window? ${tickTime >= windowStartTime && tickTime <= windowEndTime}`);

      // Note: Changed < to <= for windowEndTime to include ticks exactly at the end time
      if (tickTime >= windowStartTime && tickTime <= windowEndTime) {
        // console.log(`Tick ${tick.dateObj.toISOString()} (${tick.status}) is in window ${i}`);

        // If we find a DOWN status, immediately set window to red
        if (tick.status.toLowerCase() === 'down') {
          window.color = 'red';
          // console.log(`Window ${i} set to red due to tick:`, tick);
          break; // Move to next tick
        }
        // Otherwise, if it's UP and window isn't already red, set to green
        else if (tick.status.toLowerCase() === 'up' && window.color !== 'red') {
          window.color = 'green';
          // console.log(`Window ${i} set to green due to tick:`, tick);
          break; // Move to next tick
        }
      }
    }
  }

  // Log final window colors for debugging
  // console.log('Final window colors:', windows.map((w, i) => ({
  //   index: i,
  //   start: w.start.toISOString(),
  //   end: w.end.toISOString(),
  //   color: w.color
  // })));

  // Return just the colors for the UI
  return windows.map(window => window.color);
}

function UptimeTicks({ history }: { history: string[] }) {
  return (
    <div className="flex gap-1 mt-4">
      {history.map((color, index) => (
        <div
          key={index}
          className={`w-6 h-2 rounded ${
            color === 'red' ? 'bg-red-500' :
            color === 'green' ? 'bg-green-500' :
            'bg-gray-400'
          }`}
          title={`${
            color === 'red' ? 'down' :
            color === 'green' ? 'up' :
            'unknown'
          } - ${3 * index} minutes ago`}
        />
      ))}
    </div>
  );
}

function WebsiteCard({ website, onDelete }: {
  website: {
    id: string;
    url: string;
    ticks: Array<{
      createdAt: string;
      status: string;
    }>;
  };
  onDelete: (websiteId: string) => Promise<void>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Handle case when ticks array is empty or undefined
  const ticks = website.ticks || [];

  // Sort ticks by date (newest first) for consistent processing
  const sortedTicks = [...ticks].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // newest first
  });

  // Log the sorted ticks to verify they're in the correct order
  // console.log('Sorted ticks (newest first):', sortedTicks.map(tick => ({
  //   date: new Date(tick.createdAt).toISOString(),
  //   status: tick.status
  // })));

  // console.log('Website URL:', website.url);
  // console.log('Website ticks:', sortedTicks);
  // console.log('Tick statuses:', sortedTicks.map(tick => tick.status));

  // Process ticks for the history timeline
  // Log the actual tick times for debugging
  // console.log('Tick timestamps:', sortedTicks.map(tick => {
  //   const date = new Date(tick.createdAt);
  //   return {
  //     original: tick.createdAt,
  //     formatted: date.toISOString(),
  //     status: tick.status
  //   };
  // }));

  const aggregatedHistory = aggregateTicksToWindows(sortedTicks.map(tick => ({
    createdAt: tick.createdAt,
    status: tick.status.toLowerCase() as WebsiteStatus
  })));

  // Get current status from the most recent tick, or 'unknown' if no ticks
  const currentStatus = sortedTicks.length > 0
    ? sortedTicks[0].status as WebsiteStatus
    : 'unknown';
  // console.log('Current status:', currentStatus);
  // Calculate uptime percentage
  const calculateUptime = () => {
    if (ticks.length === 0) return { value: 0, status: 'unknown' };

    const upTicks = ticks.filter(tick => tick.status === 'UP').length;
    const percentage = Number(((upTicks / ticks.length) * 100).toFixed(1));

    let status = 'unknown';
    if (ticks.length > 0) {
      status = percentage >= 95 ? 'good' : percentage >= 80 ? 'fair' : 'bad';
    }

    return { value: percentage, status };
  };

  const uptime = calculateUptime();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); //Prevent expanding the card when i click on the delete button
    if (confirm('Are you sure you want to delete this website?')) {
      setIsDeleting(true);
      try {
        await onDelete(website.id);
      } catch (err) {
        console.error("Error deleting website:", err);
      } finally {
        setIsDeleting(false);
      }
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <StatusCircle status={currentStatus} />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{website.url}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{website.url}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Uptime percentage display */}
          <div className="flex items-center">
            <div className={`text-sm font-medium ${
              uptime.status === 'good' ? 'text-green-500' :
              uptime.status === 'fair' ? 'text-yellow-500' :
              uptime.status === 'bad' ? 'text-red-500' :
              'text-gray-400'
            }`}>
              {uptime.status === 'unknown' ? 'No data' : `${uptime.value}% uptime`}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50"
              title="Delete website"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
          <div className="mt-3">
            <UptimeTicks history={aggregatedHistory} />
            <h4 className="text-sm  font-light text-gray-700 dark:text-gray-400 pt-2">Last checked: {sortedTicks.length > 0 ? sortedTicks[0].createdAt.substring(11, 16) : 'N/A'}</h4>
          </div>
        </div>
      )}
    </div>
  );
}

function AddWebsiteModal({ isOpen, onClose , onAdd }: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (url: string) => Promise<void>;
}) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onAdd(url);
      setUrl('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add website');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Website</h2>
          <button
            onClick={()=> onClose()}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : 'Add Website'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateWebsiteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
    >
      <Plus className="w-5 h-5" />
      <span>Add Website</span>
    </button>
  );
}

function DarkModeToggle() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.theme = newIsDark ? 'dark' : 'light';
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle dark mode"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

function Dashboard() {
  const {websites, refreshWebsites, loading} = useWebsites();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getToken } = useAuth();


  const handleAddWebsite = async (url: string) => {
    const token = await getToken();
    try {
      console.log('Attempting to add website:', url);
      console.log('API URL:', `${API_BACKEND_URL}/app/v1/website`);

      const response = await axios.post(`${API_BACKEND_URL}/app/v1/website`, {
        url,
      }, {
        headers: {
          'Authorization': token,
        }
      });

      console.log('Website added:', response.data);
      refreshWebsites();
      return response.data;
    } catch (error) {
      console.error('Error adding website:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
          }
        });
      }
      throw error;
    }
  };

  const handleDeleteWebsite = async (websiteId: string) => {
    const token = await getToken();
    try {
      console.log('Attempting to delete website:', websiteId);

      const response = await axios.delete(`${API_BACKEND_URL}/app/v1/website/`, {
        headers: {
          'Authorization': token,
        },
        params: {
          websiteID: websiteId
        }
      });

      console.log('Website deleted:', response.data);
      refreshWebsites();
    } catch (error) {
      console.error('Error deleting website:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
        });
      }
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Uptime Monitor</h1>
          </div>
          <div className="flex items-center gap-4">
            <CreateWebsiteButton onClick={() => setIsModalOpen(true)} />
            <DarkModeToggle />
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">Loading websites...</p>
          ) : websites.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No websites added yet. Add your first website to monitor.</p>
          ) : (
            websites.map((website) => (
              <WebsiteCard key={website.id} website={website} onDelete={handleDeleteWebsite}/>
            ))
          )}
        </div>

        <AddWebsiteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddWebsite}
        />
      </div>
    </div>
  );
}

export default Dashboard;
