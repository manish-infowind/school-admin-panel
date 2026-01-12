import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VerificationStatus, ComputedStatus } from '@/api/types';
import { Search, X } from 'lucide-react';
import { faceStatusList } from '@/api/mockData';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status?: ComputedStatus | '';
  onStatusChange: (value: ComputedStatus | '') => void;
  startDate?: string;
  onStartDateChange: (value: string) => void;
  endDate?: string;
  onEndDateChange: (value: string) => void;
  minScore?: string;
  onMinScoreChange: (value: string) => void;
  maxScore?: string;
  onMaxScoreChange: (value: string) => void;
  onReset: () => void;
}

export function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  minScore,
  onMinScoreChange,
  maxScore,
  onMaxScoreChange,
  onReset,
}: FilterBarProps) {
  const hasFilters = search || status || startDate || endDate || minScore || maxScore;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name, email, phone..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={status || 'all'} 
              onValueChange={(value) => onStatusChange(value === 'all' ? '' : (value as ComputedStatus))}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {faceStatusList?.map(list => (
                  <SelectItem key={list.value} value={list.value}>{list.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minScore">Min Score</Label>
            <Input
              id="minScore"
              type="number"
              min="0"
              max="100"
              placeholder="0"
              value={minScore}
              onChange={(e) => onMinScoreChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxScore">Max Score</Label>
            <Input
              id="maxScore"
              type="number"
              min="0"
              max="100"
              placeholder="100"
              value={maxScore}
              onChange={(e) => onMaxScoreChange(e.target.value)}
            />
          </div>

          {hasFilters && (
            <div className="flex items-end">
              <Button variant="outline" onClick={onReset} className="w-full">
                <X className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

