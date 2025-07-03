// StatsCards.tsx
import { Link } from "react-router-dom";
import { Calendar, TrendingUp, Users } from "lucide-react";

interface StatsCardsProps {
  total: number;
  trending: number;
  reviews: number;
}

export function StatsCards({ total, trending, reviews }: StatsCardsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/** Movies In Theaters **/}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-200 uppercase">
              Movies In Theaters
            </h3>
            <Calendar className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{total}</div>
          <p className="text-xs text-gray-400">Latest releases</p>
        </div>

        {/** Trending Now **/}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-200 uppercase">
              Trending Now
            </h3>
            <TrendingUp className="h-5 w-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{trending}</div>
          <p className="text-xs text-gray-400">Hot picks today</p>
        </div>

        {/** Total Reviews **/}
        <Link
          to="/reviews"
          className="block backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 flex flex-col hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-200 uppercase">
              Total Reviews
            </h3>
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {reviews.toLocaleString()}
          </div>
          <p className="text-xs text-gray-400">Community ratings</p>
        </Link>
      </div>

      {/* CLEAR CALL-TO-ACTION LINK */}
      <div className="mt-6 text-center">
        <Link
          to="/reviews"
          className="inline-block text-lg font-semibold text-blue-500 hover:underline"
        >
          👉 Click here to see all user reviews
        </Link>
      </div>
    </>
  );
}
