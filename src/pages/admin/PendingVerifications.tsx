import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { usePendingVerifications, useApproveOrRejectVerification } from '@/api/hooks/useFaceVerification';
import { FilterBar } from '@/components/admin/face-verification/FilterBar';
import { VerificationCard } from '@/components/admin/face-verification/VerificationCard';
import { ApprovalModal } from '@/components/admin/face-verification/ApprovalModal';
import PaginationControls from '@/components/ui/paginationComp';
import { FaceVerification, ApprovalData } from '@/api/types';

export default function PendingVerifications() {
  const navigate = useNavigate();

  // Filters
  const [search, setSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [selectedVerification, setSelectedVerification] = useState<FaceVerification | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  // Build query params
  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: pageSize,
    };

    if (search.trim()) params.search = search.trim();

    return params;
  }, [search, currentPage, pageSize]);

  const { verifications, pagination, isLoading, error, refetch } = usePendingVerifications(queryParams);
  const approveOrRejectMutation = useApproveOrRejectVerification();

  const handleResetFilters = useCallback(() => {
    setSearch('');
    setCurrentPage(1);
  }, []);

  const handleViewDetails = useCallback((id: number) => {
    navigate(`/admin/face-verifications/${id}`);
  }, [navigate]);

  const handleApprove = useCallback((id: number) => {
    const verification = verifications.find((v) => v.id === id);
    if (verification) {
      setSelectedVerification(verification);
      setIsApprovalModalOpen(true);
    }
  }, [verifications]);

  const handleReject = useCallback((id: number) => {
    const verification = verifications.find((v) => v.id === id);
    if (verification) {
      setSelectedVerification(verification);
      setIsApprovalModalOpen(true);
    }
  }, [verifications]);

  const handleApproveSubmit = useCallback((data: ApprovalData) => {
    if (selectedVerification) {
      approveOrRejectMutation.mutate(
        { id: selectedVerification.id, data },
        {
          onSuccess: () => {
            setIsApprovalModalOpen(false);
            setSelectedVerification(null);
          },
        }
      );
    }
  }, [selectedVerification, approveOrRejectMutation]);

  const handleRejectSubmit = useCallback((data: ApprovalData) => {
    if (selectedVerification) {
      approveOrRejectMutation.mutate(
        { id: selectedVerification.id, data: { ...data, isApproved: false } },
        {
          onSuccess: () => {
            setIsApprovalModalOpen(false);
            setSelectedVerification(null);
          },
        }
      );
    }
  }, [selectedVerification, approveOrRejectMutation]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading pending verifications</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
              Pending Verifications Queue
            </h1>
            <p className="text-muted-foreground mt-2">
              Review and approve pending face verification requests
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          status=""
          onStatusChange={() => {}}
          isVerified=""
          onIsVerifiedChange={() => {}}
          startDate=""
          onStartDateChange={() => {}}
          endDate=""
          onEndDateChange={() => {}}
          minScore=""
          onMinScoreChange={() => {}}
          maxScore=""
          onMaxScoreChange={() => {}}
          onReset={handleResetFilters}
        />

        {/* Verifications List */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : verifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No pending verifications</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {verifications.map((verification) => (
                <VerificationCard
                  key={verification.id}
                  verification={verification}
                  onViewDetails={handleViewDetails}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  pageSize={pageSize}
                  totalItems={pagination.total}
                  pageSizeOptions={[10, 20, 50]}
                  startItem={(currentPage - 1) * pageSize + 1}
                  endItem={Math.min(currentPage * pageSize, pagination.total)}
                  visiblePages={[]}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Approval Modal */}
      <ApprovalModal
        verification={selectedVerification}
        isOpen={isApprovalModalOpen}
        onClose={() => {
          setIsApprovalModalOpen(false);
          setSelectedVerification(null);
        }}
        onApprove={handleApproveSubmit}
        onReject={handleRejectSubmit}
        isLoading={approveOrRejectMutation.isPending}
      />
    </div>
  );
}

