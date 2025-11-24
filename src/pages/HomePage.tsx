import {
  Clock,
  TrendingUp,
  AlertCircle,
  Bell,
  MapPin,
  ArrowRight,
  Droplets,
  Thermometer,
  Wind
} from 'lucide-react';
import { FavoritesSection } from '../components/FavoritesSection';
import { useBestCragsLaterToday } from '../hooks/useBestCragsLaterToday';
import { useHomeData } from '../hooks/useHomeData';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();
  const { data: laterToday, isLoading: loadingLater } = useBestCragsLaterToday();
  const { heroCards, favoriteCragCards, watchlistCrags } = useHomeData();

  const handleCragClick = (cragId: string) => {
    navigate(`/explore?crag=${cragId}`);
  };

  const getHeroCardIcon = (type: string) => {
    switch (type) {
      case 'best-now':
        return <TrendingUp className="text-emerald-600" size={20} />;
      case 'project-update':
        return <Clock className="text-sky-600" size={20} />;
      case 'alert':
        return <AlertCircle className="text-amber-600" size={20} />;
      default:
        return null;
    }
  };

  const reliabilityLabel = (reliability?: 'high' | 'medium' | 'low') => {
    switch (reliability) {
      case 'high':
        return 'Høy pålitelighet';
      case 'medium':
        return 'Moderat pålitelighet';
      case 'low':
        return 'Lav pålitelighet';
      default:
        return 'Oppdateres';
    }
  };

  const formattedDate = new Intl.DateTimeFormat('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  const formattedTime = new Intl.DateTimeFormat('nb-NO', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[#f7f8fc] pb-24">
      <div className="px-5 pt-6 max-w-4xl mx-auto space-y-6">
        <header className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <MapPin size={18} className="text-blue-600" />
              <span>Oslo, Norge</span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Dine klatreforhold i dag</h1>
              <p className="text-sm text-slate-500">{formattedDate} · Oppdatert {formattedTime}</p>
            </div>
          </div>
          <button className="p-2.5 rounded-full bg-white shadow-sm border border-slate-100 text-slate-700 hover:shadow-md transition-all" aria-label="Varsler">
            <Bell size={18} />
          </button>
        </header>

        <section className="grid md:grid-cols-[1.2fr_0.9fr] gap-3">
          {heroCards.map((card) => (
            <button
              key={card.id}
              onClick={() => card.cragId && handleCragClick(card.cragId)}
              className={`w-full text-left rounded-3xl border shadow-sm transition-all hover:shadow-md ${
                card.type === 'best-now'
                  ? 'bg-gradient-to-br from-[#e8f2ff] via-white to-[#f7fbff] border-blue-100'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200">
                      {getHeroCardIcon(card.type)}
                      <span>{card.title}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{card.location}</h3>
                      <p className="text-sm text-slate-500">{card.region}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-inner">
                      <span className="text-2xl font-bold">{card.score}</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                      {card.statusLabel}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Thermometer size={16} className="text-rose-500" />
                    <span>{card.temperature}°C</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind size={16} className="text-blue-600" />
                    <span>{card.wind}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets size={16} className="text-sky-600" />
                    <span>{card.humidity}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>{card.subtitle}</span>
                  <div className="flex items-center gap-2 text-blue-700 font-semibold">
                    {card.timeWindow || card.timeframeLabel}
                    <ArrowRight size={16} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 w-fit">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {reliabilityLabel(card.reliability)}
                </div>
              </div>
            </button>
          ))}
        </section>

        <FavoritesSection
          favorites={favoriteCragCards}
          onCragClick={handleCragClick}
        />

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Følger med</h2>
              <p className="text-sm text-slate-500">Hold et øye med prosjektene dine</p>
            </div>
            <button className="text-blue-700 text-sm font-semibold hover:underline">Legg til</button>
          </div>
          <div className="space-y-3">
            {watchlistCrags.map((crag) => (
              <button
                key={crag.id}
                onClick={() => handleCragClick(crag.id)}
                className="w-full bg-white rounded-2xl border border-slate-200 p-4 text-left shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-blue-700">{crag.region}</p>
                    <h3 className="text-base font-semibold text-slate-900">{crag.name}</h3>
                    <p className="text-sm text-slate-600">{crag.statusNote}</p>
                    <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                      <Clock size={14} />
                      <span>{crag.nextWindow}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-inner">
                      <span className="text-xl font-bold">{crag.frictionScore}</span>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <Thermometer size={14} className="text-rose-500" />
                        <span>{crag.temperature}°C</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wind size={14} className="text-blue-600" />
                        <span>{crag.wind}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Dagens nøkkeltimer</h2>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1">Vindskifte</span>
          </div>
          <div className="space-y-2">
            {loadingLater ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : laterToday && laterToday.length > 0 ? (
              laterToday.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCragClick(suggestion.cragId)}
                  className="w-full text-left bg-white p-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Clock className="text-blue-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="text-base font-semibold text-slate-900">{suggestion.cragName}</h3>
                        <span className="text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">{suggestion.timeWindow}</span>
                      </div>
                      <p className="text-sm text-slate-600">{suggestion.summary}</p>
                    </div>
                    <ArrowRight className="text-slate-400" size={18} />
                  </div>
                </button>
              ))
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                <p className="text-slate-500">Ingen anbefalte vinduer tilgjengelig</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
