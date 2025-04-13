"use client";
import { API_BACKEND_URL} from "@/config";
import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react";
import axios from "axios";

interface Website {
    id: string;
    url: string;
    ticks: Array<{
      id: string;
      createdAt: string;
      status: 'UP' | 'DOWN'; // Fixed from lowercase
      latency: number;
    }>;
}

export function useWebsites() {
    const [websites, setWebsites] = useState<Website[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getToken } = useAuth();

    const fetchWebsites = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            // console.log("Fetching websites from:", `${API_BACKEND_URL}/app/v1/websites`);

            const response = await axios.get(`${API_BACKEND_URL}/app/v1/websites`, {
                headers: {
                    Authorization: token
                }
            });

            // console.log("API response:", response.data);
            // Process the websites data to handle date timezone issues
            const websitesData = response.data || [];

            // Process the websites data
            const processedWebsites = websitesData.map((website: Website) => {
                // Ensure ticks array exists
                const websiteTicks = website.ticks || [];

                // Process each tick to ensure consistent date format
                const processedTicks = websiteTicks.map(tick => {
                    // Parse the date to ensure it's in a consistent format
                    const tickDate = new Date(tick.createdAt);

                    return {
                        ...tick,
                        // Store original for debugging
                        originalCreatedAt: tick.createdAt,
                        // Use ISO string for consistent formatting
                        createdAt: tickDate.toISOString()
                    };
                });

                // console.log(`Website ${website.url} has ${processedTicks.length} ticks`);
                if (processedTicks.length > 0) {
                    // console.log('First tick:', processedTicks[0]);
                }

                return {
                    ...website,
                    ticks: processedTicks
                };
            });

            setWebsites(processedWebsites);
            setError(null);
        } catch (err) {
            console.error("Error fetching websites:", err);
            setError("Failed to fetch websites");
            setWebsites([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWebsites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        websites,
        loading,
        error,
        refreshWebsites: fetchWebsites
    };
}
