import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { Users, Award, CheckCircle, CreditCard, X, Shield, ArrowRight } from 'lucide-react';

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
        apiRequest('/coaches/me/subscriptions'),
      ]);
      setCoaches(coachList);
      setMySubscriptions(subs);
    } catch (err) {
      console.error('Failed to load coach marketplace:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!checkoutCoach) return;
    setSubscribing(true);
    try {
      const result = await apiRequest(`/coaches/${checkoutCoach.id}/subscribe`, {
        method: 'POST',
      });
      setSuccessReceipt(result);
      await loadMarketplace();
    } catch (err: any) {
      alert(err.message || 'Subscription checkout failed.');
    } finally {
      setSubscribing(false);
    }
  };

  const specializations = [
    'All',
    'Hypertrophy',
    'Strength',
    'Powerlifting',
    'Conditioning',
    'Biomechanics',
  ];

  return (
    <div className="space-y-8">
      {/* Title Row & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Coach Directory</h1>
          <p className="text-xs text-muted mt-1">
            Certified sports science practitioners, personalized programming & active roster
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-control self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeTab === 'browse'
                ? 'bg-active text-text font-semibold'
                : 'text-muted hover:text-text'
            }`}
          >
            Browse Coaches
          </button>
          <button
            onClick={() => setActiveTab('my-subs')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeTab === 'my-subs'
                ? 'bg-active text-text font-semibold'
                : 'text-muted hover:text-text'
            }`}
          >
            My Retainers ({mySubscriptions.length})
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <div className="space-y-6">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[10px] font-mono uppercase text-faint mr-1">Discipline:</span>
            {specializations.map((spec) => {
              const isSelected =
                (spec === 'All' && !specializationFilter) || specializationFilter === spec;
              return (
                <button
                  key={spec}
                  onClick={() => setSpecializationFilter(spec === 'All' ? '' : spec)}
                  className={`text-xs px-2.5 py-1 rounded-control border transition-colors ${
                    isSelected
                      ? 'border-text bg-raised text-text font-medium'
                      : 'border-border text-muted hover:text-text hover:bg-raised/40'
                  }`}
                >
                  {spec}
                </button>
              );
            })}
          </div>

          {/* Coach Cards Grid */}
          {loading ? (
            <div className="py-16 text-center text-xs font-mono text-muted animate-pulse">
              Querying verified coaching registry...
            </div>
          ) : coaches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coaches.map((coach) => {
                const isSubscribed = mySubscriptions.some(
                  (s) => s.coachId === coach.id && s.status === 'ACTIVE',
                );

                return (
                  <div
                    key={coach.id}
                    className="bg-surface border border-border rounded-card p-5 flex flex-col justify-between space-y-4 hover:border-text/30 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-semibold text-text">{coach.user?.name}</h3>
                            {coach.isVerified && (
                              <Shield className="w-3.5 h-3.5 text-positive fill-positive/10" />
                            )}
                          </div>
                          <div className="text-xs text-muted mt-0.5">
                            {coach.yearsExperience} yrs experience
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-semibold text-text font-mono">
                            ${coach.monthlyRate}
                          </span>
                          <span className="text-[11px] text-faint block">/ month</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted/90 leading-relaxed line-clamp-3">
                        {coach.bio || 'Specialized in compound movement mechanics, periodization, and load autoregulation.'}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {(coach.specializations || ['Strength', 'Hypertrophy']).map(
                          (spec: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ground border border-border text-muted"
                            >
                              {spec}
                            </span>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] text-faint font-mono">
                        {coach.certifications?.[0] || 'NSCA-CSCS'}
                      </span>

                      {isSubscribed ? (
                        <span className="text-xs font-medium text-positive flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Active Retainer</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setCheckoutCoach(coach);
                            setSuccessReceipt(null);
                          }}
                          className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-ink hover:bg-neutral-200 rounded-control transition-colors"
                        >
                          Retain Coach
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-muted bg-surface border border-border rounded-card">
              No certified coaches matched the selected criteria.
            </div>
          )}
        </div>
      ) : (
        /* My Subscriptions Tab */
        <div className="space-y-4">
          {mySubscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mySubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-surface border border-border rounded-card p-5 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-ground border border-border text-positive">
                        {sub.status}
                      </span>
                      <h3 className="text-base font-semibold text-text mt-2">
                        {sub.coach?.user?.name || 'Assigned Coach'}
                      </h3>
                      <p className="text-xs text-muted">
                        Active Periodization Retainer
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-mono font-semibold text-text">
                        ${sub.coach?.monthlyRate || 120}
                      </div>
                      <div className="text-[11px] text-faint font-mono">Monthly Rate</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-ground border border-border/80 rounded-control text-xs">
                    <div>
                      <span className="text-[10px] text-faint font-mono block">START DATE</span>
                      <span className="font-mono text-text">
                        {new Date(sub.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-faint font-mono block">RENEWAL DATE</span>
                      <span className="font-mono text-text">
                        {new Date(sub.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-muted bg-surface border border-border rounded-card">
              No active coach retainers. Browse the directory to retain a coach.
            </div>
          )}
        </div>
      )}

      {/* Mock Subscription Checkout Modal */}
      {checkoutCoach && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-card w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-text">Coaching Retainer</h3>
              <button
                onClick={() => setCheckoutCoach(null)}
                className="text-muted hover:text-text p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {successReceipt ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-positive/10 border border-positive/20 text-positive rounded-control flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>30-Day Coaching Retainer Activated</span>
                </div>
                <div className="p-3 bg-ground border border-border rounded-control space-y-1.5 font-mono text-muted text-[11px]">
                  <div className="flex justify-between">
                    <span>COACH</span>
                    <span className="text-text">{checkoutCoach.user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TRANSACTION</span>
                    <span className="text-text">MOCK-AUTH-OK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BILLED</span>
                    <span className="text-text">${checkoutCoach.monthlyRate}.00</span>
                  </div>
                </div>
                <button
                  onClick={() => setCheckoutCoach(null)}
                  className="w-full bg-primary text-primary-ink py-2 rounded-control font-medium hover:bg-neutral-200 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-ground border border-border rounded-control space-y-1">
                  <div className="font-semibold text-text">{checkoutCoach.user?.name}</div>
                  <div className="text-muted text-[11px]">{checkoutCoach.bio}</div>
                  <div className="pt-2 flex justify-between font-mono text-sm border-t border-border mt-2">
                    <span className="text-muted text-xs">Monthly Retainer:</span>
                    <span className="text-text font-bold">${checkoutCoach.monthlyRate}.00</span>
                  </div>
                </div>

                <div className="text-faint text-[11px] leading-relaxed">
                  Sandbox subscription: click confirm to simulate the 30-day payment contract. No credit card will be charged.
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setCheckoutCoach(null)}
                    className="flex-1 py-2 text-xs border border-border text-muted hover:text-text rounded-control transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className="flex-1 py-2 text-xs font-medium bg-primary text-primary-ink hover:bg-neutral-200 rounded-control transition-colors disabled:opacity-50"
                  >
                    {subscribing ? 'Processing...' : 'Confirm Retainer'}
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
