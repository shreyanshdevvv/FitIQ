import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { Users, Award, ShieldCheck, CheckCircle, CreditCard, X, DollarSign } from 'lucide-react';

export const CoachMarketplacePage: React.FC = () => {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [mySubscriptions, setMySubscriptions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-subs'>('browse');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock Checkout Modal
  const [checkoutCoach, setCheckoutCoach] = useState<any>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<any>(null);

  useEffect(() => {
    loadMarketplace();
  }, [specializationFilter]);

  const loadMarketplace = async () => {
    setLoading(true);
    try {
      const query = specializationFilter ? `?specialization=${specializationFilter}` : '';
      const [coachList, subs] = await Promise.all([
        apiRequest(`/coaches${query}`),
        apiRequest('/coaches/subscriptions/my'),
      ]);
      setCoaches(coachList);
      setMySubscriptions(subs);
    } catch (err) {
      console.error('Failed to load marketplace data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!checkoutCoach) return;
    setSubscribing(true);
    try {
      const res = await apiRequest(`/coaches/${checkoutCoach.id}/subscribe`, {
        method: 'POST',
      });
      setSuccessReceipt(res.subscription);
      await loadMarketplace();
    } catch (err: any) {
      alert(err.message || 'Subscription failed');
    } finally {
      setSubscribing(false);
    }
  };

  const handleCancelSub = async (subId: string) => {
    if (!confirm('Are you sure you want to cancel this coaching subscription?')) return;
    try {
      await apiRequest(`/coaches/subscriptions/${subId}/cancel`, { method: 'PATCH' });
      await loadMarketplace();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Coach Marketplace</h1>
          <p className="text-sm text-slate-400 mt-1">
            Connect with certified trainers for specialized programming and guidance.
          </p>
        </div>

        {/* View Switch */}
        <div className="flex p-1 bg-surface-card rounded-lg border border-border-subtle text-xs">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              activeTab === 'browse' ? 'bg-accent-volt text-background' : 'text-slate-300 hover:text-white'
            }`}
          >
            Explore Coaches ({coaches.length})
          </button>
          <button
            onClick={() => setActiveTab('my-subs')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              activeTab === 'my-subs' ? 'bg-accent-volt text-background' : 'text-slate-300 hover:text-white'
            }`}
          >
            My Subscriptions ({mySubscriptions.length})
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2">Specialization:</span>
            {['', 'MUSCLE_BUILDING', 'WEIGHT_LOSS', 'ENDURANCE', 'YOGA', 'REHABILITATION'].map((spec) => (
              <button
                key={spec}
                onClick={() => setSpecializationFilter(spec)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  specializationFilter === spec
                    ? 'bg-accent-volt/15 border-accent-volt text-white font-semibold'
                    : 'bg-surface border-border-subtle text-slate-300 hover:border-slate-500'
                }`}
              >
                {spec ? spec.replace('_', ' ') : 'All Coaches'}
              </button>
            ))}
          </div>

          {/* Coach Cards Grid */}
          {loading ? (
            <div className="py-20 text-center">
              <Users className="w-8 h-8 animate-spin text-accent-volt mx-auto mb-2" />
              <p className="text-sm text-slate-400">Loading certified trainers...</p>
            </div>
          ) : coaches.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-surface border border-border-subtle">
              <p className="text-slate-400 text-sm">No coaches found matching this specialization.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coaches.map((c) => (
                <div
                  key={c.id}
                  className="p-6 rounded-xl bg-surface border border-border-subtle flex flex-col justify-between hover:border-slate-600 transition-all shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-white text-base">{c.user?.name}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Award className="w-3.5 h-3.5 text-accent-cyan" />
                          {c.experienceYears} Years Experience
                        </p>
                      </div>
                      <span className="font-mono text-lg font-bold text-accent-volt">
                        ${c.monthlyPriceUsd}<span className="text-xs text-slate-400">/mo</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 bg-surface-card/60 p-3 rounded-lg border border-border-subtle">
                      "{c.bio}"
                    </p>

                    <div>
                      <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                        Specializations:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {c.specializations?.map((s: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-card border border-border-subtle text-slate-300"
                          >
                            {s.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-border-subtle flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-mono">
                      {c._count?.subscriptions || 0} active clients
                    </span>
                    <button
                      onClick={() => setCheckoutCoach(c)}
                      className="px-4 py-2 rounded-lg bg-accent-volt hover:bg-accent-volt-hover text-background font-bold text-xs shadow transition-all"
                    >
                      Subscribe ($30 Days)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* My Subscriptions Tab */
        <div className="space-y-4">
          {mySubscriptions.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-surface border border-border-subtle">
              <p className="text-slate-400 text-sm">You have no active coach subscriptions.</p>
              <button
                onClick={() => setActiveTab('browse')}
                className="mt-3 text-xs font-semibold text-accent-volt hover:underline"
              >
                Browse available trainers →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle rounded-xl bg-surface border border-border-subtle overflow-hidden">
              {mySubscriptions.map((sub) => (
                <div key={sub.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {sub.coachProfile?.user?.name || 'Personal Coach'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        sub.status === 'ACTIVE'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      Valid through: {new Date(sub.endDate).toLocaleDateString()} • Amount: ${sub.amountPaid}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Mock Transaction ID: {sub.mockTransactionId}
                    </p>
                  </div>

                  {sub.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleCancelSub(sub.id)}
                      className="px-3.5 py-1.5 rounded-lg border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
                    >
                      Cancel Membership
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mock Payment Drawer / Modal */}
      {checkoutCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-surface border border-border-subtle p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-accent-volt" />
                <h3 className="font-bold text-white text-base">Mock Subscription Checkout</h3>
              </div>
              <button
                onClick={() => { setCheckoutCoach(null); setSuccessReceipt(null); }}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {successReceipt ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent-volt/20 text-accent-volt flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">Subscription Active!</h4>
                  <p className="text-xs text-slate-400 mt-1">Mock payment verified. 30-day membership granted.</p>
                </div>
                <div className="p-3.5 rounded-lg bg-surface-card border border-border-subtle font-mono text-xs text-left space-y-1 text-slate-300">
                  <p><strong>Receipt:</strong> {successReceipt.mockTransactionId}</p>
                  <p><strong>Amount:</strong> ${successReceipt.amountPaid}</p>
                  <p><strong>Status:</strong> MOCK_PAID (Active)</p>
                </div>
                <button
                  onClick={() => { setCheckoutCoach(null); setSuccessReceipt(null); setActiveTab('my-subs'); }}
                  className="w-full py-2.5 rounded-lg bg-accent-volt text-background font-bold text-sm"
                >
                  View My Subscriptions
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-surface-card border border-border-subtle space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Coach:</span>
                    <strong className="text-white">{checkoutCoach.user?.name}</strong>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Plan Duration:</span>
                    <span className="text-slate-200">30 Days</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-border-subtle font-bold">
                    <span className="text-white">Total Mock Charge:</span>
                    <span className="text-accent-volt">${checkoutCoach.monthlyPriceUsd}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-background border border-border-subtle text-[11px] text-slate-400">
                  ℹ️ This is a simulated checkout. No credit card will be charged. Clicking below generates a verified mock receipt and activates your coaching access immediately.
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setCheckoutCoach(null)}
                    className="px-4 py-2 rounded-lg bg-surface-card text-xs font-semibold text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className="px-5 py-2 rounded-lg bg-accent-volt hover:bg-accent-volt-hover text-background font-bold text-xs disabled:opacity-50"
                  >
                    {subscribing ? 'Processing Mock Charge...' : `Confirm & Pay $${checkoutCoach.monthlyPriceUsd}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
