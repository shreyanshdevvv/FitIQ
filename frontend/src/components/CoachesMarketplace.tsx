import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CoachProfile, CoachSubscription } from '../types/fitness';
import { 
  Users, 
  Award, 
  CheckCircle2, 
  CreditCard, 
  Loader2, 
  XCircle, 
  Calendar,
  Filter
} from 'lucide-react';

export const CoachesMarketplace: React.FC = () => {
  const [coaches, setCoaches] = useState<CoachProfile[]>([]);
  const [subscriptions, setSubscriptions] = useState<CoachSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coachList, mySubs] = await Promise.all([
        api.getCoaches(selectedSpecialization || undefined),
        api.getMySubscriptions(),
      ]);
      setCoaches(coachList);
      setSubscriptions(mySubs);
    } catch (err: any) {
      console.error('Failed to load coaches data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSpecialization]);

  const handleSubscribe = async (coachId: string) => {
    setSubscribingId(coachId);
    setFeedbackMsg(null);
    try {
      const res = await api.subscribeToCoach(coachId);
      setFeedbackMsg(res.message || 'Subscribed successfully!');
      await loadData();
    } catch (err: any) {
      alert(`Subscription note: ${err.message}`);
    } finally {
      setSubscribingId(null);
    }
  };

  const handleCancel = async (subId: string) => {
    setCancellingId(subId);
    setFeedbackMsg(null);
    try {
      const res = await api.cancelSubscription(subId);
      setFeedbackMsg(res.message || 'Subscription cancelled.');
      await loadData();
    } catch (err: any) {
      alert(`Cancellation note: ${err.message}`);
    } finally {
      setCancellingId(null);
    }
  };

  const specializations = [
    { value: '', label: 'All Specializations' },
    { value: 'MUSCLE_BUILDING', label: 'Muscle Building' },
    { value: 'WEIGHT_LOSS', label: 'Weight Loss' },
    { value: 'ENDURANCE', label: 'Endurance' },
    { value: 'YOGA', label: 'Yoga' },
    { value: 'REHABILITATION', label: 'Rehabilitation' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
            Certified Human Coaches & Marketplace
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            Dedicated 1-on-1 Coaching
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pair your AI routines with verified human coach reviews, programming, and accountability.
          </p>
        </div>

        {/* Specialization Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800"
          >
            {specializations.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Active Subscriptions Section */}
      {subscriptions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
              My Active Coaching Subscriptions ({subscriptions.length})
            </h3>
            <span className="text-[11px] font-mono text-emerald-600 font-semibold">
              Mock Payment Enabled
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {subscriptions.map((sub) => {
              const isActive = sub.status === 'ACTIVE';

              return (
                <div key={sub.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {sub.coachProfile?.user?.name || 'Certified Coach'}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      ${sub.amountPaid} USD/mo • Renews: {new Date(sub.endDate).toLocaleDateString()} • Tx ID: {sub.mockTransactionId}
                    </p>
                  </div>

                  {isActive && (
                    <button
                      onClick={() => handleCancel(sub.id)}
                      disabled={cancellingId === sub.id}
                      className="px-3 py-1.5 border border-slate-200 hover:border-rose-300 hover:text-rose-600 text-slate-600 rounded-lg text-xs font-medium transition-colors self-start sm:self-auto flex items-center gap-1.5"
                    >
                      {cancellingId === sub.id && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span>Cancel Subscription</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Coaches Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
          Available Certified Coaches ({coaches.length})
        </h3>

        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
            <span>Loading certified coaches...</span>
          </div>
        ) : coaches.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
            No coaches found matching this specialization filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coaches.map((coach) => {
              const isAlreadySubscribed = subscriptions.some(
                (s) => s.coachProfileId === coach.id && s.status === 'ACTIVE'
              );

              return (
                <div
                  key={coach.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition-colors space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          {coach.user?.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {coach.user?.email} • {coach.experienceYears} Years Experience
                        </p>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-lg font-bold text-slate-900">
                          ${coach.monthlyPriceUsd}
                        </span>
                        <span className="text-[10px] text-slate-400 block">/ month</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      "{coach.bio}"
                    </p>

                    {/* Certifications & Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {coach.certifications.map((cert, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                        >
                          <Award className="w-3 h-3 text-slate-500" />
                          <span>{cert}</span>
                        </span>
                      ))}

                      {coach.specializations.map((spec, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold"
                        >
                          {spec.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      {coach._count?.subscriptions || 0} active clients
                    </span>

                    {isAlreadySubscribed ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Subscribed</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(coach.id)}
                        disabled={subscribingId === coach.id || !coach.isAcceptingClients}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                      >
                        {subscribingId === coach.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CreditCard className="w-3.5 h-3.5" />
                        )}
                        <span>Subscribe (${coach.monthlyPriceUsd}/mo)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
