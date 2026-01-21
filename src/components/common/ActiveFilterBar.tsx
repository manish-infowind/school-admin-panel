import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarDays, Filter, Search } from "lucide-react";
import { allCategories, allStatus, oldNewQue } from "@/api/mockData";

const ActiveFilterBar = (props) => {
    const {
        showActiveFilter,
        filterValues,
        dateRange,
        clearAllFilters,
        activeFilterHandler,
        clearDateFilters,
        handleDateRangeChange,
    } = props;

    const datePickerRef = useRef<HTMLDivElement>(null);

    const [datePickerPosition, setDatePickerPosition] = useState('bottom');
    const [datePickerHorizontalPosition, setDatePickerHorizontalPosition] = useState('left');
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);


    // Toggle date picker with positioning logic
    const toggleDatePicker = () => {
        if (!isDatePickerOpen) {
            // Calculate position before opening
            const button = datePickerRef.current?.querySelector('button');
            if (button) {
                const rect = button.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const viewportWidth = window.innerWidth;
                const spaceBelow = viewportHeight - rect.bottom;
                const spaceAbove = rect.top;
                const spaceRight = viewportWidth - rect.left;
                const spaceLeft = rect.left;

                // Vertical positioning
                if (spaceBelow < 400 && spaceAbove > 400) {
                    setDatePickerPosition('top');
                } else {
                    setDatePickerPosition('bottom');
                }

                // Horizontal positioning
                if (spaceRight < 320 && spaceLeft > 320) {
                    setDatePickerHorizontalPosition('right');
                } else {
                    setDatePickerHorizontalPosition('left');
                }
            }
        }
        setIsDatePickerOpen(!isDatePickerOpen);
    };


    return (
        <Card>
            <CardContent className="pt-6">
                {/* Filter Bar Active Section */}
                {showActiveFilter && (
                    <div className="mb-4 p-3 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">Active Filters:</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAllFilters}
                                className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                            >
                                Clear All
                            </Button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {filterValues?.searchTerm && (
                                <Badge variant="outline" className="text-xs">
                                    Search: "{filterValues?.searchTerm}"
                                </Badge>
                            )}
                            {filterValues?.status !== "all" && (
                                <Badge variant="outline" className="text-xs">
                                    Status: {filterValues?.status}
                                </Badge>
                            )}
                            {filterValues?.category !== "all" && (
                                <Badge variant="outline" className="text-xs">
                                    Category: {filterValues?.category}
                                </Badge>
                            )}
                            {filterValues?.severity !== "all" && filterValues?.severity && (
                                <Badge variant="outline" className="text-xs">
                                    Severity: {filterValues?.severity}
                                </Badge>
                            )}
                            {filterValues?.parentCategory !== "all" && filterValues?.parentCategory && (
                                <Badge variant="outline" className="text-xs">
                                    Parent: {filterValues?.parentCategory}
                                </Badge>
                            )}

                            {dateRange?.startDate && (
                                <Badge variant="outline" className="text-xs">
                                    From: {format(dateRange?.startDate, 'MMM dd, yyyy')}
                                </Badge>
                            )}
                            {dateRange?.endDate && (
                                <Badge variant="outline" className="text-xs">
                                    To: {format(dateRange?.endDate, 'MMM dd, yyyy')}
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search reports by reason, description, or ID..."
                            name="searchTerm"
                            value={filterValues?.searchTerm}
                            onChange={activeFilterHandler}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <select
                            name="status"
                            value={filterValues?.status}
                            onChange={activeFilterHandler}
                            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="new">New</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                            <option value="dismissed">Dismissed</option>
                        </select>

                        <select
                            name="severity"
                            value={filterValues?.severity || "all"}
                            onChange={activeFilterHandler}
                            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
                        >
                            <option value="all">All Severity</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>

                        <select
                            name="category"
                            value={filterValues?.category}
                            onChange={activeFilterHandler}
                            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
                        >
                            <option value="all">All Categories</option>
                            {allCategories.map(name => (
                                <option key={name?.name} value={name?.value}>{name?.name}</option>
                            ))}
                        </select>

                        {filterValues?.parentCategory !== undefined && (
                            <select
                                name="parentCategory"
                                value={filterValues?.parentCategory || "all"}
                                onChange={activeFilterHandler}
                                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
                            >
                                <option value="all">All Parent Categories</option>
                                <option value="System">System</option>
                                <option value="Payment">Payment</option>
                                <option value="Account">Account</option>
                            </select>
                        )}

                        <select
                            name="sortOrder"
                            value={filterValues?.sortOrder}
                            onChange={activeFilterHandler}
                            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
                        >
                            {oldNewQue.map(name => (
                                <option key={name?.name} value={name?.value}>{name?.name}</option>
                            ))}
                        </select>

                        {/* Date Range Filter */}
                        <div className="relative" ref={datePickerRef}>
                            <Button
                                variant={dateRange?.startDate || dateRange?.endDate ? "default" : "outline"}
                                onClick={toggleDatePicker}
                                className={`px-3 py-2 h-auto text-sm ${dateRange?.startDate || dateRange?.endDate ? 'bg-brand-green hover:bg-brand-green/90 text-white text-white' : ''}`}
                            >
                                <CalendarDays className="h-4 w-4 mr-2" />
                                {dateRange?.startDate && dateRange?.endDate ? (
                                    `${format(dateRange?.startDate, 'MMM dd')} - ${format(dateRange?.endDate, 'MMM dd, yyyy')}`
                                ) : dateRange?.startDate ? (
                                    `From ${format(dateRange?.startDate, 'MMM dd, yyyy')}`
                                ) : dateRange?.endDate ? (
                                    `Until ${format(dateRange?.endDate, 'MMM dd, yyyy')}`
                                ) : (
                                    "Date Range"
                                )}
                                {(dateRange?.startDate || dateRange?.endDate) && (
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                        Active
                                    </Badge>
                                )}
                            </Button>

                            {isDatePickerOpen && (
                                <div
                                    className={`absolute z-50 bg-background border border-border rounded-lg shadow-lg p-4 min-w-[300px] max-h-[400px] overflow-y-auto ${datePickerPosition === 'bottom'
                                        ? 'top-full mt-1'
                                        : 'bottom-full mb-1'
                                        } ${datePickerHorizontalPosition === 'left'
                                            ? 'left-0'
                                            : 'right-0'
                                        }`}
                                    style={{
                                        maxHeight: 'calc(100vh - 200px)',
                                        maxWidth: 'calc(100vw - 40px)'
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-sm">Select Date Range</h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => (clearDateFilters(), setIsDatePickerOpen(false))}
                                            className="h-6 px-2 text-xs"
                                        >
                                            Clear
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={dateRange?.startDate ? format(dateRange?.startDate, 'yyyy-MM-dd') : ''}
                                                onChange={(e) => {
                                                    const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined;
                                                    handleDateRangeChange(date, dateRange?.endDate),
                                                        setIsDatePickerOpen(false);
                                                }}
                                                className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                value={dateRange?.endDate ? format(dateRange?.endDate, 'yyyy-MM-dd') : ''}
                                                onChange={(e) => {
                                                    const date = e.target.value ? new Date(e.target.value + 'T23:59:59') : undefined;
                                                    handleDateRangeChange(dateRange?.startDate, date),
                                                        setIsDatePickerOpen(false);
                                                }}
                                                className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                                            />
                                        </div>
                                    </div>

                                    {/* Quick Date Presets */}
                                    <div className="mt-3 pt-3 border-t border-border">
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const today = new Date();
                                                    const yesterday = new Date(today);
                                                    yesterday.setDate(yesterday.getDate() - 1);
                                                    handleDateRangeChange(yesterday, today),
                                                        setIsDatePickerOpen(false);
                                                }}
                                                className="h-7 text-xs justify-start"
                                            >
                                                Last 2 Days
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const today = new Date();
                                                    const weekAgo = new Date(today);
                                                    weekAgo.setDate(weekAgo.getDate() - 7);
                                                    handleDateRangeChange(weekAgo, today),
                                                        setIsDatePickerOpen(false);
                                                }}
                                                className="h-7 text-xs justify-start"
                                            >
                                                Last 7 Days
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const today = new Date();
                                                    const monthAgo = new Date(today);
                                                    monthAgo.setDate(monthAgo.getDate() - 30);
                                                    handleDateRangeChange(monthAgo, today),
                                                        setIsDatePickerOpen(false);
                                                }}
                                                className="h-7 text-xs justify-start"
                                            >
                                                Last 30 Days
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const today = new Date();
                                                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                                                    handleDateRangeChange(startOfMonth, today),
                                                        setIsDatePickerOpen(false);
                                                }}
                                                className="h-7 text-xs justify-start"
                                            >
                                                This Month
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsDatePickerOpen(false)}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => setIsDatePickerOpen(false)}
                                            className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white"
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
};

export default ActiveFilterBar;