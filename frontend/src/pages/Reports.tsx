import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileTextIcon,
  DownloadIcon,
  EyeIcon,
  SearchIcon,
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

interface Report {
  id: string;
  name: string;
  date: string;
  location: string;
  status: 'suitable' | 'conditional' | 'unsuitable';
  harvestPotential: number;
}

type StatusFilter = 'all' | Report['status'];
type SortOption = 'newest' | 'oldest' | 'potential';

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const deriveStatus = (value?: string): Report['status'] => {
    const normalized = (value ?? '').toLowerCase();
    if (normalized.includes('unsuitable') || normalized.includes('not')) {
      return 'unsuitable';
    }
    if (
      normalized.includes('suitable') ||
      normalized.includes('high') ||
      normalized.includes('recommended')
    ) {
      return 'suitable';
    }
    return 'conditional';
  };

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please sign in to view your reports.');
      }

      const response = await fetch('/api/assessments', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || 'Failed to load assessments.');
      }

      const payload = await response.json();
      const list = Array.isArray(payload) ? payload : [payload];

      const normalized = list.map((item: any, index: number): Report => {
        const createdAt =
          item.createdAt || item.updatedAt || item.date || new Date().toISOString();
        const potential =
          item.potentialHarvest ??
          item.potential_harvest ??
          item.harvestPotential ??
          item.harvest_potential ??
          0;

        const harvestValue =
          typeof potential === 'string' ? parseFloat(potential) : Number(potential);

        return {
          id: item._id ?? item.id ?? `${index}`,
          name: item.name || t('Assessment Report'),
          date: createdAt,
          location: item.address || item.location || '',
          status: deriveStatus(item.status ?? item.feasibility),
          harvestPotential: Number.isFinite(harvestValue) ? harvestValue : 0,
        };
      });

      setReports(normalized);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load reports.';
      setError(message);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filteredReports = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filtered = reports.filter((report) => {
      const matchesSearch =
        !query ||
        report.name.toLowerCase().includes(query) ||
        report.location.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'all' || report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortOption === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return (b.harvestPotential || 0) - (a.harvestPotential || 0);
    });
  }, [reports, searchTerm, statusFilter, sortOption]);

  const getStatusBadge = (status: Report['status']) => {
    switch (status) {
      case 'suitable':
        return (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {t('Highly Suitable')}
          </span>
        );
      case 'conditional':
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
            {t('Conditionally Suitable')}
          </span>
        );
      case 'unsuitable':
        return (
          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
            {t('Not Recommended')}
          </span>
        );
    }
  };

  const formatHarvestPotential = (value: number) => {
    if (!value) {
      return 'N/A';
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M L/year`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K L/year`;
    }
    return `${value.toLocaleString()} L/year`;
  };

  const formatDate = (value: string) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : parsed.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
  };

  return (
    <MainLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t('Assessment Reports')}
          </h1>
          <p className="text-gray-600">
            {t('View and manage your past assessments')}
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/assessment')}>
          {t('New Assessment')}
        </Button>
      </div>

      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t('Search reports...')}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="border border-gray-300 rounded-lg py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('All')}</option>
              <option value="suitable">{t('Highly Suitable')}</option>
              <option value="conditional">{t('Conditionally Suitable')}</option>
              <option value="unsuitable">{t('Not Recommended')}</option>
            </select>

            <select
              value={sortOption}
              onChange={(event) =>
                setSortOption(event.target.value as SortOption)
              }
              className="border border-gray-300 rounded-lg py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">{t('Newest First')}</option>
              <option value="oldest">{t('Oldest First')}</option>
              <option value="potential">{t('Highest Potential')}</option>
            </select>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="mb-6 p-4 border border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <p className="text-red-700 text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={loadReports}>
              {t('Retry')}
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <Card className="p-6 text-center text-gray-600">
          {t('Loading reports...')}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card
              key={report.id}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-start">
                  <div className="p-3 bg-blue-50 rounded-lg mr-4">
                    <FileTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{report.name}</h3>
                    <p className="text-gray-600 text-sm">
                      {report.location || '—'}
                    </p>
                    <div className="flex items-center mt-2 flex-wrap gap-3">
                      <span className="text-xs text-gray-500">
                        {formatDate(report.date)}
                      </span>
                      {getStatusBadge(report.status)}
                      <span className="text-xs font-medium text-blue-700">
                        {formatHarvestPotential(report.harvestPotential)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<EyeIcon size={16} />}
                    onClick={() => navigate(`/results?id=${report.id}`)}
                  >
                    {t('View')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<DownloadIcon size={16} />}
                  >
                    {t('Download')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {t('No reports yet')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('Start your first assessment to generate a report.')}
          </p>
          <Button variant="primary" onClick={() => navigate('/assessment')}>
            {t('Start Assessment')}
          </Button>
        </div>
      )}
    </MainLayout>
  );
};

export default Reports;
