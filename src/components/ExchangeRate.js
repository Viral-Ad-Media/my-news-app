"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const FALLBACK_API_KEY = "47cdba4ec2852c4342e27f3d";
const exchangeApiKey =
  process.env.NEXT_PUBLIC_EXCHANGE_API_KEY || FALLBACK_API_KEY;

export default function ExchangeRate() {
  const [exchangeRates, setExchangeRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchRates = async () => {
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${exchangeApiKey}/latest/NGN`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();

        const transformedData = [
          { currency: "USD", rate: 1 / data.conversion_rates.USD, flag: "/flags/US.png" },
          { currency: "CAD", rate: 1 / data.conversion_rates.CAD, flag: "/flags/CA.png" },
          { currency: "AUD", rate: 1 / data.conversion_rates.AUD, flag: "/flags/AU.png" },
          { currency: "GBP", rate: 1 / data.conversion_rates.GBP, flag: "/flags/GB.png" },
          { currency: "AED", rate: 1 / data.conversion_rates.AED, flag: "/flags/AE.png" },
          { currency: "CNY", rate: 1 / data.conversion_rates.CNY, flag: "/flags/CN.png" },
          { currency: "EGP", rate: 1 / data.conversion_rates.EGP, flag: "/flags/EG.png" },
        ];

        setExchangeRates(
          transformedData.map((item) => ({
            ...item,
            rate: item.rate.toFixed(2),
          }))
        );
        setError(null);
      } catch (fetchError) {
        if (fetchError.name === "AbortError") return;
        setError("Unable to load exchange rates.");
        setExchangeRates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    return () => controller.abort();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-600">Loading exchange rates...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="text-gray mb-6">
      <h3 className="text-2xl font-bold mb-1">Naira Exchange Rates</h3>
      <div className="flex flex-col space-y-1 mb-6">
        <div className="h-0.5 w-full bg-gray-700"></div>
        <div className="h-0.5 w-full bg-gray-400"></div>
        <div className="h-0.5 w-full bg-gray-200"></div>
      </div>
      <table className="w-full text-left">
        <thead className="border-b border-gray-400">
          <tr>
            <th className="py-2">CURRENCIES</th>
            <th className="py-2">RATE (₦)</th>
          </tr>
        </thead>
        <tbody>
          {exchangeRates.map((rate) => (
            <tr key={rate.currency} className="border-b border-gray-300">
              <td className="py-2 flex items-center space-x-2">
                <Image
                  src={rate.flag}
                  alt={rate.currency}
                  width={24}
                  height={16}
                  className="w-6 h-4 object-cover rounded-sm"
                />
                <span>{rate.currency}</span>
              </td>
              <td className="py-2">{rate.rate}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-sm text-gray-400">
        Currency exchange rates in <span className="text-red-500">NGN</span> on{" "}
        {new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
}
