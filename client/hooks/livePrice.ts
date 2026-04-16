import {
  useGetCurrentPriceQuery,
  useGetPriceHistoryQuery,
} from "@/state/api/priceApi";
import { PriceRange } from "@/state/types";
import { useEffect, useRef } from "react";

export function useLivePrice(range: PriceRange) {
  const {
    data: priceData,
    isLoading: priceLoading,
    refetch: refetchPrice,
  } = useGetCurrentPriceQuery(undefined, {
    pollingInterval: 0, // disable RTK polling, we use our own
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const {
    data: historyData,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useGetPriceHistoryQuery(range, {
    pollingInterval: 0,
    refetchOnMountOrArgChange: true,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Immediate fetch on mount
    refetchPrice();
    refetchHistory();

    // Set up our own reliable interval
    intervalRef.current = setInterval(() => {
      refetchPrice();
      refetchHistory();
    }, 15000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [range, refetchPrice, refetchHistory]);

  return {
    priceData,
    historyData,
    priceLoading,
    historyLoading,
    refetchPrice,
    refetchHistory,
  };
}
