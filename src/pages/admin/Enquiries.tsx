import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  Eye,
  Reply,
  Trash2,
  Filter,
  Search,
  Download,
  MoreVertical,
  Star,
  Archive,
  CheckCircle,
  XCircle,
  User,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useEnquiries } from "@/api/hooks/useEnquiries";
import { EnquiryService } from "@/api/services/enquiryService";
import { Enquiry } from "@/api/types";
import { format } from "date-fns";
import { API_CONFIG } from "@/api/config";

// Decryption utility class
class EnquiryDecryption {
  private algorithm: string;
  private keyLength: number;
  private ivLength: number;
  private aad: Uint8Array;

  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
    this.ivLength = 128;
    this.aad = new TextEncoder().encode('enquiry-export');
  }

  // Convert base64 to ArrayBuffer
  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Convert hex string to ArrayBuffer
  hexToArrayBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes.buffer;
  }

  // Decrypt a single enquiry record
  async decryptEnquiryRecord(encryptedRecord: any) {
    try {
      console.log('🔓 Decrypting record:', {
        fullName: encryptedRecord.fullName?.substring(0, 50) + '...',
        email: encryptedRecord.email?.substring(0, 50) + '...',
        phone: encryptedRecord.phone?.substring(0, 50) + '...',
        message: encryptedRecord.message?.substring(0, 50) + '...',
        contactDate: encryptedRecord.contactDate
      });

      // Extract encryption parameters from the record
      const encryptedData = encryptedRecord.fullName; // hex format
      const encryptionKey = encryptedRecord.email;    // base64 format
      const iv = encryptedRecord.phone;               // base64 format
      const tag = encryptedRecord.message;            // base64 format
      const contactDate = encryptedRecord.contactDate; // unencrypted

      // Validate that we have all required fields
      if (!encryptedData || !encryptionKey || !iv || !tag) {
        throw new Error('Missing required encryption fields');
      }

      console.log('🔑 Encryption parameters:', {
        encryptedDataLength: encryptedData.length,
        encryptionKeyLength: encryptionKey.length,
        ivLength: iv.length,
        tagLength: tag.length,
        contactDate: contactDate
      });

      // Convert to ArrayBuffers
      const keyBuffer = this.base64ToArrayBuffer(encryptionKey);
      const ivBuffer = this.base64ToArrayBuffer(iv);
      const tagBuffer = this.base64ToArrayBuffer(tag);
      const dataBuffer = this.hexToArrayBuffer(encryptedData);

      console.log('🔑 Buffer sizes:', {
        keyBufferSize: keyBuffer.byteLength,
        ivBufferSize: ivBuffer.byteLength,
        tagBufferSize: tagBuffer.byteLength,
        dataBufferSize: dataBuffer.byteLength
      });

      // Import the key
      const key = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: this.algorithm },
        false,
        ['decrypt']
      );

      // Combine encrypted data with auth tag
      const encryptedBuffer = new Uint8Array(dataBuffer.byteLength + tagBuffer.byteLength);
      encryptedBuffer.set(new Uint8Array(dataBuffer), 0);
      encryptedBuffer.set(new Uint8Array(tagBuffer), dataBuffer.byteLength);

      // Decrypt using AES-GCM with additional authenticated data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: new Uint8Array(ivBuffer),
          additionalData: this.aad,
          tagLength: this.ivLength
        },
        key,
        encryptedBuffer
      );

      // Convert to string and parse JSON
      const decryptedText = new TextDecoder().decode(decryptedBuffer);
      const decryptedData = JSON.parse(decryptedText);

      console.log('✅ Decryption successful:', decryptedData);

      // Return the decrypted record with original contact date
      return {
        fullName: decryptedData.fullName || '',
        email: decryptedData.email || '',
        phone: decryptedData.phone || '',
        message: decryptedData.message || '',
        contactDate: contactDate || ''
      };

    } catch (error) {
      console.error('❌ Decryption failed for record:', error);
      console.error('❌ Record data:', encryptedRecord);
      throw new Error(`Failed to decrypt enquiry record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Decrypt all enquiry records
  async decryptEnquiries(encryptedEnquiries: any[]) {
    const decryptedEnquiries = [];
    
    for (let i = 0; i < encryptedEnquiries.length; i++) {
      try {
        const decryptedRecord = await this.decryptEnquiryRecord(encryptedEnquiries[i]);
        decryptedEnquiries.push(decryptedRecord);
      } catch (error) {
        console.error(`Failed to decrypt record ${i}:`, error);
        // Continue with other records
      }
    }
    
    return decryptedEnquiries;
  }
}

export default function Enquiries() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [starredFilter, setStarredFilter] = useState<string>("all");
  const [repliesFilter, setRepliesFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerPosition, setDatePickerPosition] = useState<'bottom' | 'top'>('bottom');
  const [datePickerHorizontalPosition, setDatePickerHorizontalPosition] = useState<'left' | 'right'>('left');
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<Enquiry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<string>("today");
  const [exportCustomStartDate, setExportCustomStartDate] = useState<Date | undefined>(undefined);
  const [exportCustomEndDate, setExportCustomEndDate] = useState<Date | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStage, setExportStage] = useState<string>("");
  const [useWebWorkers, setUseWebWorkers] = useState(true); // Enable Web Workers by default

  // Ref for date picker click outside
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Use the API hook
  const {
    enquiries,
    selectedEnquiry,
    pagination,
    isLoading,
    isUpdating,
    isDeleting,
    error,
    fetchEnquiries,
    getEnquiry,
    setSelectedEnquiry,
    updateStatus,
    toggleStar,
    deleteEnquiry,
    replyToEnquiry,
    clearError,
  } = useEnquiries({
    autoFetch: true,
    limit: 10,
  });

  // Filter enquiries based on search and status
  const filteredEnquiries = enquiries.filter((enquiry) => {
    const matchesSearch =
      enquiry.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.inquiryCategory.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || enquiry.status === statusFilter;

    const matchesCategory =
      categoryFilter === "all" || enquiry.inquiryCategory === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Check if any filters are active
  const hasActiveFilters = 
    searchTerm || 
    statusFilter !== "all" || 
    categoryFilter !== "all" || 
    starredFilter !== "all" || 
    repliesFilter !== "all" || 
    startDate || 
    endDate;

  // Handle search and filter changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when filters change
      
      const params = {
        page: 1,
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        starred: starredFilter !== "all" ? starredFilter === "true" : undefined,
        hasReplies: repliesFilter !== "all" ? repliesFilter === "true" : undefined,
        sortBy: sortBy,
        sortOrder: sortOrder,
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      };
      
      console.log('📅 Raw dates:', { startDate, endDate });
      console.log('📅 Formatted dates:', { 
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined
      });
      
      console.log('🔍 Fetching enquiries with params:', params);
      console.log('📅 Date filters:', { startDate, endDate });
      console.log('🎯 Active filters count:', Object.values(params).filter(v => v !== undefined).length);
      console.log('🎯 Sort params:', { sortBy, sortOrder });
      console.log('🎯 Date params:', { 
        startDate: params.startDate, 
        endDate: params.endDate,
        startDateType: typeof params.startDate,
        endDateType: typeof params.endDate
      });
      

      
      fetchEnquiries(params);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, categoryFilter, starredFilter, repliesFilter, sortBy, sortOrder, startDate, endDate, fetchEnquiries]);

  // Handle click outside date picker and window resize
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };

    const handleWindowResize = () => {
      if (isDatePickerOpen) {
        setIsDatePickerOpen(false);
      }
    };

    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', handleWindowResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [isDatePickerOpen]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchEnquiries({
      page,
      search: searchTerm || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
      starred: starredFilter !== "all" ? starredFilter === "true" : undefined,
      hasReplies: repliesFilter !== "all" ? repliesFilter === "true" : undefined,
      sortBy: sortBy,
      sortOrder: sortOrder,
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
    });
  };

  // Handle date range changes
  const handleDateRangeChange = (from: Date | undefined, to: Date | undefined) => {
    console.log('📅 Date range changed:', { from, to });
    console.log('📅 Formatted dates:', { 
      from: from ? format(from, 'yyyy-MM-dd') : undefined,
      to: to ? format(to, 'yyyy-MM-dd') : undefined
    });
    setStartDate(from);
    setEndDate(to);
    setIsDatePickerOpen(false);
    
    // Immediately trigger API call with new dates
    const params = {
      page: 1,
      search: searchTerm || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
      starred: starredFilter !== "all" ? starredFilter === "true" : undefined,
      hasReplies: repliesFilter !== "all" ? repliesFilter === "true" : undefined,
      sortBy: sortBy,
      sortOrder: sortOrder,
      startDate: from ? format(from, 'yyyy-MM-dd') : undefined,
      endDate: to ? format(to, 'yyyy-MM-dd') : undefined,
    };
    
    console.log('📅 Immediate API call with params:', params);
    fetchEnquiries(params);
  };

  // Clear date filters
  const clearDateFilters = () => {
    console.log('🗑️ Clearing date filters');
    setStartDate(undefined);
    setEndDate(undefined);
    
    // Immediately trigger API call without dates
    const params = {
      page: 1,
      search: searchTerm || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
      starred: starredFilter !== "all" ? starredFilter === "true" : undefined,
      hasReplies: repliesFilter !== "all" ? repliesFilter === "true" : undefined,
      sortBy: sortBy,
      sortOrder: sortOrder,
    };
    
    console.log('🗑️ Immediate API call after clearing dates:', params);
    fetchEnquiries(params);
  };

  // Clear all filters
  const clearAllFilters = () => {
    console.log('🗑️ Clearing all filters');
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setStarredFilter("all");
    setRepliesFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setStartDate(undefined);
    setEndDate(undefined);
    
    // Immediately trigger API call with cleared filters
    console.log('🗑️ Immediate API call after clearing all filters');
    fetchEnquiries({
      page: 1,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  // Export enquiries to CSV
  const exportEnquiries = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportStage("Initializing export...");
    
    const startTime = Date.now();
    const minDuration = 5000; // 5 seconds minimum
    
    try {
      let dateFilter: string;
      let requestBody: any = {};

      // Calculate date range based on selection
      setExportProgress(10);
      setExportStage("Calculating date range...");
      
      // Add small delay for smooth feel
      await new Promise(resolve => setTimeout(resolve, 300));
      
      switch (exportDateRange) {
        case "today":
          dateFilter = "today";
          requestBody = { dateFilter };
          break;
        case "last7days":
          dateFilter = "last7days";
          requestBody = { dateFilter };
          break;
        case "month":
          dateFilter = "thisMonth";
          requestBody = { dateFilter };
          break;
        case "year":
          dateFilter = "thisYear";
          requestBody = { dateFilter };
          break;
        case "custom":
          if (exportCustomStartDate && exportCustomEndDate) {
            dateFilter = "custom";
            requestBody = {
              dateFilter,
              startDate: format(exportCustomStartDate, 'yyyy-MM-dd'),
              endDate: format(exportCustomEndDate, 'yyyy-MM-dd')
            };
          } else {
            throw new Error("Custom date range requires both start and end dates");
          }
          break;
        default:
          throw new Error("Invalid date range selection");
      }

      setExportProgress(20);
      setExportStage("Preparing export request...");
      
      console.log('📤 Sending export request:', requestBody);
      
      // Add delay for smooth feel
      await new Promise(resolve => setTimeout(resolve, 400));

      // Call the export API endpoint
      const response = await EnquiryService.exportEnquiries(requestBody);
      
      console.log('📥 API Response received:', response);

      setExportProgress(50);
      setExportStage("Processing server response...");
      
      // Add delay for smooth feel
      await new Promise(resolve => setTimeout(resolve, 600));

      if (response.success && response.data) {
        const { enquiries: encryptedEnquiries, totalCount } = response.data;
        
        console.log('📊 Encrypted export response received:', {
          encryptedEnquiriesCount: encryptedEnquiries.length,
          totalCount,
          sampleEncryptedRecord: encryptedEnquiries[0],
          hasEnquiries: !!encryptedEnquiries,
          enquiriesType: typeof encryptedEnquiries,
          isArray: Array.isArray(encryptedEnquiries)
        });
        
        if (!encryptedEnquiries || !Array.isArray(encryptedEnquiries)) {
          throw new Error('Invalid response format: enquiries array not found');
        }
        
        setExportProgress(70);
        setExportStage("Preparing decryption...");
        
        // Add delay for smooth feel
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Choose decryption method based on settings and browser support
        let csvRows: string[] = ['"Customer Name","Email","Phone","Message","Date of Contact"'];
        
        if (useWebWorkers && typeof Worker !== 'undefined') {
          console.log('🚀 Using Web Workers for parallel decryption...');
          csvRows = await decryptWithWebWorkers(encryptedEnquiries);
        } else {
          console.log('🚀 Using main thread parallel decryption...');
          
          // Decrypt the enquiries using main thread parallel processing
          const decryption = new EnquiryDecryption();
          csvRows = ['"Customer Name","Email","Phone","Message","Date of Contact"'];
          
          console.log('📄 Starting CSV generation...');
          console.log('📄 CSV Header:', csvRows[0]);
          
          setExportProgress(75);
          setExportStage("Decrypting records...");
          
          // Process records in parallel batches for faster decryption
          const batchSize = 10; // Process 10 records at a time
          const totalBatches = Math.ceil(encryptedEnquiries.length / batchSize);
          
          console.log(`🚀 Starting parallel decryption: ${encryptedEnquiries.length} records in ${totalBatches} batches of ${batchSize}`);
          
          for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            const startIndex = batchIndex * batchSize;
            const endIndex = Math.min(startIndex + batchSize, encryptedEnquiries.length);
            const currentBatch = encryptedEnquiries.slice(startIndex, endIndex);
            
            // Update progress for batch
            const batchProgress = 75 + (batchIndex / totalBatches) * 15; // 75% to 90%
            setExportProgress(Math.floor(batchProgress));
            setExportStage(`Decrypting batch ${batchIndex + 1} of ${totalBatches} (records ${startIndex + 1}-${endIndex})...`);
            
            // Add small delay for smooth feel
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Process current batch in parallel
            const batchPromises = currentBatch.map(async (encryptedRecord, index) => {
              try {
                const actualIndex = startIndex + index;
                const decryptedRecord = await decryption.decryptEnquiryRecord(encryptedRecord);
                
                // Convert record to CSV row
                const csvRow = [
                  `"${decryptedRecord.fullName || ''}"`,
                  `"${decryptedRecord.email || ''}"`,
                  `"${decryptedRecord.phone || ''}"`,
                  `"${(decryptedRecord.message || '').replace(/"/g, '""')}"`,
                  `"${decryptedRecord.contactDate || ''}"`
                ].join(',');
                
                console.log(`📄 Record ${actualIndex + 1} processed in batch ${batchIndex + 1}:`, {
                  fullName: decryptedRecord.fullName,
                  email: decryptedRecord.email
                });
                
                return { index: actualIndex, csvRow, success: true };
              } catch (error) {
                console.error(`❌ Failed to decrypt record ${startIndex + index + 1} in batch ${batchIndex + 1}:`, error);
                return { index: startIndex + index, csvRow: '"","","","",""', success: false };
              }
            });
            
            // Wait for all records in current batch to complete
            const batchResults = await Promise.all(batchPromises);
            
            // Sort results by original index and add to CSV rows
            batchResults
              .sort((a, b) => a.index - b.index)
              .forEach(result => {
                csvRows[result.index + 1] = result.csvRow; // +1 for header row
              });
            
            console.log(`✅ Batch ${batchIndex + 1} completed: ${batchResults.filter(r => r.success).length}/${batchResults.length} records successful`);
          }
        }
        
        console.log('🔓 All records decrypted and processed');
        console.log('📄 Total CSV rows:', csvRows.length);
        
        setExportProgress(90);
        setExportStage("Finalizing CSV file...");
        
        // Add delay for smooth feel
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Combine all rows into final CSV
        const csvData = csvRows.join('\n');
        
        // Log the CSV content for debugging
        console.log('📄 Generated CSV Content:');
        console.log('='.repeat(80));
        console.log(csvData);
        console.log('='.repeat(80));
        console.log('📄 CSV Content Length:', csvData.length, 'characters');
        console.log('📄 Number of records:', encryptedEnquiries.length);
        
        setExportProgress(85);
        setExportStage("Finalizing export...");
        
        // Add delay for smooth feel
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Download file
        const today = new Date();
        const filename = `enquiries_${exportDateRange}_${format(today, 'yyyy-MM-dd')}.csv`;
        downloadCSV(csvData, filename);
        
        console.log('📥 File downloaded as:', filename);
        
        setExportProgress(100);
        setExportStage("Export completed!");
        
        // Calculate remaining time to ensure minimum 5 seconds
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minDuration - elapsedTime);
        
        // Wait for remaining time to complete minimum duration
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        
        // Small delay to show completion
        setTimeout(() => {
          toast({
            title: "Export Successful",
            description: `Exported ${totalCount} enquiries to CSV.`,
          });
          
          setIsExportModalOpen(false);
          setExportProgress(0);
          setExportStage("");
        }, 1000);
        
      } else {
        throw new Error("Failed to export enquiries");
      }
    } catch (error) {
      console.error('❌ Export failed:', error);
      setExportProgress(0);
      setExportStage("Export failed");
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export enquiries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Convert enquiries to CSV format
  const convertToCSV = (enquiries: Array<{
    fullName: string;
    email: string;
    phone: string;
    message: string;
    contactDate: string;
  }>): string => {
    const headers = ['Customer Name', 'Email', 'Phone', 'Message', 'Date of Contact'];
    const rows = enquiries.map(enquiry => [
      enquiry.fullName || '',
      enquiry.email || '',
      enquiry.phone || '',
      enquiry.message.replace(/"/g, '""') || '', // Escape quotes in CSV
      enquiry.contactDate || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    console.log('📊 CSV file generated:', {
      dataLength: enquiries.length,
      csvLength: csvContent.length,
      sampleData: enquiries[0]
    });
    
    return csvContent;
  };

  // Test CSV generation with sample data
  const testCSVGeneration = () => {
    const sampleData = [
      {
        fullName: "Test User",
        email: "test@example.com",
        phone: "+1234567890",
        message: "This is a test message",
        contactDate: "2024-01-15"
      },
      {
        fullName: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "+0987654321",
        message: "Another test message with quotes \"inside\"",
        contactDate: "2024-01-16"
      }
    ];
    
    console.log('🧪 Testing CSV generation with sample data:', sampleData);
    const testCSV = convertToCSV(sampleData);
    
    // Show CSV preview
    console.log('📄 Test CSV Preview:');
    console.log('='.repeat(80));
    console.log(testCSV);
    console.log('='.repeat(80));
    
    downloadCSV(testCSV, 'test_export.csv');
  };

  // Test base64 decoding
  const testBase64Decoding = () => {
    try {
      console.log('🧪 Testing base64 decoding...');
      const decryption = new EnquiryDecryption();
      
      // Test with a simple base64 string
      const testBase64 = btoa('Hello World');
      const decoded = decryption.base64ToArrayBuffer(testBase64);
      console.log('🧪 Base64 test successful:', {
        original: 'Hello World',
        base64: testBase64,
        decodedLength: decoded.byteLength
      });
    } catch (error) {
      console.error('🧪 Base64 test failed:', error);
    }
  };

  // Test with the exact data provided by user
  const testWithProvidedData = async () => {
    try {
      console.log('🧪 Testing with provided encrypted data...');
      const decryption = new EnquiryDecryption();
      
      const testRecord = {
        "fullName": "dfe3e51164451a97216e3345c29324601e609fd785524f99ccec751aca13716f0ae931d0fac06a2b24652f3ff015c468b388ab7628a56fa4fa4626230e04e2cc940c7ce9ac138de31c7ab1d350ebd1029296c43c4edccc63c104f96dd9fc0267c1c51f57c5937dcf2ba8f72bf9f5f715b3a37953cd8df438605ca38521c557b8418a705d766d75776a72d5997c6df66b447bbcc4f6d4e83571780d44860a5041c6375e726b5830e5cdc3cf4cd0211389a4bbd07760e796dcf2e2ff88a32c957cdd43543a97a80250056450d6764588bc774f51d1d91276ffa27a23ff47afa05d84463d17d991ef7bcfc3af49ed3ca0f4d4a76fadd3abb8e76d4ea6157d",
        "email": "DxcUUBZI2hpm8Z7RYdBUz2dO+ml6XBaFPhfcsfrnnNw=",
        "phone": "qGpWY9BMiv+13w35rzNkYw==",
        "message": "2ujonAGAv99mosSXqkgLuA==",
        "contactDate": "2025-08-02"
      };
      
      console.log('🧪 Test record:', testRecord);
      
      const decrypted = await decryption.decryptEnquiryRecord(testRecord);
      console.log('🧪 Decryption successful:', decrypted);
      
      // Test CSV generation with decrypted data
      const csvRow = [
        `"${decrypted.fullName || ''}"`,
        `"${decrypted.email || ''}"`,
        `"${decrypted.phone || ''}"`,
        `"${(decrypted.message || '').replace(/"/g, '""')}"`,
        `"${decrypted.contactDate || ''}"`
      ].join(',');
      
      console.log('🧪 Generated CSV row:', csvRow);
      
    } catch (error) {
      console.error('🧪 Test with provided data failed:', error);
    }
  };

  // Test API call
  const testAPICall = async () => {
    try {
      console.log('🧪 Testing API call...');
      const response = await EnquiryService.exportEnquiries({ dateFilter: 'today' });
      console.log('🧪 API Test Response:', response);
      
      if (response.success && response.data && response.data.enquiries) {
        console.log('🧪 Sample encrypted record:', response.data.enquiries[0]);
        console.log('🧪 Total records:', response.data.enquiries.length);
        
        // Test decryption of first record
        if (response.data.enquiries.length > 0) {
          const decryption = new EnquiryDecryption();
          try {
            const decrypted = await decryption.decryptEnquiryRecord(response.data.enquiries[0]);
            console.log('🧪 Decryption test successful:', decrypted);
          } catch (decryptError) {
            console.error('🧪 Decryption test failed:', decryptError);
          }
        }
      }
    } catch (error) {
      console.error('🧪 API Test Failed:', error);
    }
  };

  // Web Worker-based parallel decryption
  const decryptWithWebWorkers = async (encryptedEnquiries: any[]): Promise<string[]> => {
    const batchSize = 20; // Larger batches for Web Workers
    const totalBatches = Math.ceil(encryptedEnquiries.length / batchSize);
    const csvRows = ['"Customer Name","Email","Phone","Message","Date of Contact"'];
    
    console.log(`🚀 Starting Web Worker decryption: ${encryptedEnquiries.length} records in ${totalBatches} batches of ${batchSize}`);
    
    // Create multiple workers for parallel processing
    const workerCount = Math.min(4, totalBatches); // Use up to 4 workers
    const workers = Array.from({ length: workerCount }, () => 
      new Worker('/decryption-worker.js')
    );
    
    let completedBatches = 0;
    
    return new Promise<string[]>((resolve, reject) => {
      const processBatch = async (batchIndex: number) => {
        if (batchIndex >= totalBatches) {
          // All batches processed
          workers.forEach(worker => worker.terminate());
          resolve(csvRows);
          return;
        }
        
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, encryptedEnquiries.length);
        const currentBatch = encryptedEnquiries.slice(startIndex, endIndex);
        
        // Update progress
        const batchProgress = 75 + (completedBatches / totalBatches) * 15;
        setExportProgress(Math.floor(batchProgress));
        setExportStage(`Decrypting batch ${batchIndex + 1} of ${totalBatches} (records ${startIndex + 1}-${endIndex})...`);
        
        const worker = workers[batchIndex % workerCount];
        
        worker.onmessage = (e) => {
          const { type, data } = e.data;
          
          if (type === 'batch-complete') {
            const { results } = data;
            
            // Sort results by index and add to CSV rows
            results
              .sort((a: any, b: any) => a.index - b.index)
              .forEach((result: any) => {
                if (result.success) {
                  const decryptedRecord = result.data;
                  const csvRow = [
                    `"${decryptedRecord.fullName || ''}"`,
                    `"${decryptedRecord.email || ''}"`,
                    `"${decryptedRecord.phone || ''}"`,
                    `"${(decryptedRecord.message || '').replace(/"/g, '""')}"`,
                    `"${decryptedRecord.contactDate || ''}"`
                  ].join(',');
                  csvRows[startIndex + result.index + 1] = csvRow;
                } else {
                  csvRows[startIndex + result.index + 1] = '"","","","",""';
                }
              });
            
            completedBatches++;
            console.log(`✅ Batch ${batchIndex + 1} completed via Web Worker`);
            
            // Process next batch
            processBatch(batchIndex + 1);
          } else if (type === 'batch-error') {
            console.error(`❌ Web Worker batch ${batchIndex + 1} failed:`, data.error);
            // Add empty rows for failed batch
            for (let i = 0; i < currentBatch.length; i++) {
              csvRows[startIndex + i + 1] = '"","","","",""';
            }
            completedBatches++;
            processBatch(batchIndex + 1);
          }
        };
        
        worker.onerror = (error) => {
          console.error(`❌ Web Worker error in batch ${batchIndex + 1}:`, error);
          // Add empty rows for failed batch
          for (let i = 0; i < currentBatch.length; i++) {
            csvRows[startIndex + i + 1] = '"","","","",""';
          }
          completedBatches++;
          processBatch(batchIndex + 1);
        };
        
        // Send batch to worker
        worker.postMessage({
          type: 'decrypt-batch',
          data: {
            encryptedRecords: currentBatch,
            batchIndex
          }
        });
      };
      
      // Start processing batches
      for (let i = 0; i < Math.min(workerCount, totalBatches); i++) {
        processBatch(i);
      }
    });
  };

  // Download CSV file
  const downloadCSV = (csvContent: string, filename: string) => {
    try {
      console.log('📥 Downloading CSV file:', filename);
      console.log('📥 CSV content length:', csvContent.length, 'characters');
      
      const blob = new Blob([csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      
      console.log('📥 Blob created:', {
        size: blob.size,
        type: blob.type
      });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
      console.log('✅ CSV file download initiated:', filename);
    } catch (error) {
      console.error('❌ Error downloading CSV file:', error);
      throw error;
    }
  };

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

  const handleStatusChange = async (enquiryId: string, newStatus: Enquiry["status"]) => {
    const success = await updateStatus(enquiryId, newStatus);
    if (success) {
    toast({
      title: "Status Updated",
      description: `Enquiry status changed to ${newStatus}.`,
    });
    }
  };

  const handleStarToggle = async (enquiryId: string) => {
    const enquiry = enquiries.find((e) => e.id === enquiryId);
    if (enquiry) {
      const success = await toggleStar(enquiryId, !enquiry.isStarred);
      if (success) {
        toast({
          title: "Star Updated",
          description: `Enquiry ${enquiry.isStarred ? "unstarred" : "starred"}.`,
        });
      }
    }
  };

  const handleDeleteClick = (enquiryId: string) => {
    const enquiry = enquiries.find((e) => e.id === enquiryId);
    if (enquiry) {
      setEnquiryToDelete(enquiry);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!enquiryToDelete) return;

    const success = await deleteEnquiry(enquiryToDelete.id);
    if (success) {
      if (selectedEnquiry?.id === enquiryToDelete.id) {
        setSelectedEnquiry(null);
      }
      toast({
        title: "Enquiry Deleted",
        description: "The enquiry has been deleted successfully.",
      });
    }

    setIsDeleteDialogOpen(false);
    setEnquiryToDelete(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setEnquiryToDelete(null);
  };

  const handleEnquirySelect = async (enquiryId: string) => {
    try {
      await getEnquiry(enquiryId);
    } catch (error) {
      console.error('Failed to fetch enquiry details:', error);
      toast({
        title: "Error",
        description: "Failed to load enquiry details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReply = async () => {
    if (selectedEnquiry && replyMessage.trim()) {
      const success = await replyToEnquiry(selectedEnquiry.id, {
        replyMessage: replyMessage.trim()
      });
      if (success) {
      setReplyMessage("");
      setIsReplyDialogOpen(false);
      toast({
        title: "Reply Sent",
        description: `Your reply has been sent to ${selectedEnquiry.fullName}.`,
      });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { variant: "destructive" as const, label: "New" },
      "in-progress": { variant: "secondary" as const, label: "In Progress" },
      replied: { variant: "default" as const, label: "Replied" },
      closed: { variant: "outline" as const, label: "Closed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge
        variant={config.variant}
        className={
          config.variant === "default"
            ? "bg-gradient-to-r from-brand-green to-brand-teal text-white"
            : ""
        }
      >
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
              Enquiries Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage and respond to customer enquiries and contact form
              submissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsExportModalOpen(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80">
              <Mail className="h-4 w-4 mr-2" />
              Compose Email
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          {hasActiveFilters && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
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
                {searchTerm && (
                  <Badge variant="outline" className="text-xs">
                    Search: "{searchTerm}"
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="outline" className="text-xs">
                    Status: {statusFilter}
                  </Badge>
                )}
                {categoryFilter !== "all" && (
                  <Badge variant="outline" className="text-xs">
                    Category: {categoryFilter}
                  </Badge>
                )}
                {starredFilter !== "all" && (
                  <Badge variant="outline" className="text-xs">
                    Starred: {starredFilter === "true" ? "Yes" : "No"}
                  </Badge>
                )}
                {repliesFilter !== "all" && (
                  <Badge variant="outline" className="text-xs">
                    Replies: {repliesFilter === "true" ? "Has" : "None"}
                  </Badge>
                )}

                {startDate && (
                  <Badge variant="outline" className="text-xs">
                    From: {format(startDate, 'MMM dd, yyyy')}
                  </Badge>
                )}
                {endDate && (
                  <Badge variant="outline" className="text-xs">
                    To: {format(endDate, 'MMM dd, yyyy')}
                  </Badge>
                )}
              </div>
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search enquiries by name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={hasActiveFilters ? "default" : "outline"}
              onClick={clearAllFilters}
              className={`px-3 py-2 text-sm ${hasActiveFilters ? 'bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80 text-white' : ''}`}
            >
              Clear All Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Active
                </Badge>
              )}
            </Button>

            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="replied">Replied</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="all">All Categories</option>
                <option value="Product Inquiry">Product Inquiry</option>
                <option value="Technical Support">Technical Support</option>
                <option value="General Inquiry">General Inquiry</option>
                <option value="Sales Inquiry">Sales Inquiry</option>
                <option value="Partnership">Partnership</option>
                <option value="Other">Other</option>
              </select>

              <select
                value={starredFilter}
                onChange={(e) => setStarredFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="all">All Starred</option>
                <option value="true">Starred</option>
                <option value="false">Not Starred</option>
              </select>

              <select
                value={repliesFilter}
                onChange={(e) => setRepliesFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="all">All Replies</option>
                <option value="true">Has Replies</option>
                <option value="false">No Replies</option>
              </select>





              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>

              {/* Date Range Filter */}
              <div className="relative" ref={datePickerRef}>
                <Button
                  variant={startDate || endDate ? "default" : "outline"}
                  onClick={toggleDatePicker}
                  className={`px-3 py-2 h-auto text-sm ${startDate || endDate ? 'bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80 text-white' : ''}`}
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {startDate && endDate ? (
                    `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`
                  ) : startDate ? (
                    `From ${format(startDate, 'MMM dd, yyyy')}`
                  ) : endDate ? (
                    `Until ${format(endDate, 'MMM dd, yyyy')}`
                  ) : (
                    "Date Range"
                  )}
                  {(startDate || endDate) && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Active
                    </Badge>
                  )}
                </Button>

                {isDatePickerOpen && (
                  <div 
                    className={`absolute z-50 bg-background border border-border rounded-lg shadow-lg p-4 min-w-[300px] max-h-[400px] overflow-y-auto ${
                      datePickerPosition === 'bottom' 
                        ? 'top-full mt-1' 
                        : 'bottom-full mb-1'
                    } ${
                      datePickerHorizontalPosition === 'left'
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
                        onClick={clearDateFilters}
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
                          value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                          onChange={(e) => {
                            console.log('📅 Start date input changed:', e.target.value);
                            const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined;
                            handleDateRangeChange(date, endDate);
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
                          value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                          onChange={(e) => {
                            console.log('📅 End date input changed:', e.target.value);
                            const date = e.target.value ? new Date(e.target.value + 'T23:59:59') : undefined;
                            handleDateRangeChange(startDate, date);
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
                            console.log('📅 Last 2 Days preset clicked:', { yesterday, today });
                            handleDateRangeChange(yesterday, today);
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
                            handleDateRangeChange(weekAgo, today);
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
                            handleDateRangeChange(monthAgo, today);
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
                            handleDateRangeChange(startOfMonth, today);
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
                        className="flex-1 bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
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

      <div className="grid gap-6 lg:grid-cols-3 h-[calc(100vh-200px)]">
        {/* Enquiries List */}
        <div className="lg:col-span-2 flex flex-col">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1 flex flex-col"
          >
            <Card className="flex-1 flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Enquiries ({pagination.total})
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden">
                {error && (
                  <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive text-sm">{error}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchEnquiries()}
                      >
                        Retry
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearError}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex-1 flex flex-col overflow-hidden">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Loading enquiries...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                                {enquiries.map((enquiry, index) => (
                    <motion.div
                      key={enquiry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedEnquiry?.id === enquiry.id
                          ? "bg-sidebar-accent border-brand-green"
                          : "hover:bg-sidebar-accent"
                      }`}
                            onClick={() => handleEnquirySelect(enquiry.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">
                              {enquiry.fullName}
                            </h3>
                            {enquiry.isStarred && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                            {getStatusBadge(enquiry.status)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {enquiry.email}
                          </p>
                          <p className="text-sm font-medium truncate mt-1">
                            {enquiry.subject}
                          </p>
                                                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(enquiry.createdAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {enquiry.inquiryCategory}
                                </Badge>
                              </div>
                            </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStarToggle(enquiry.id);
                              }}
                                    disabled={isUpdating}
                            >
                                    {isUpdating ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                              <Star className="h-4 w-4 mr-2" />
                                    )}
                              {enquiry.isStarred ? "Unstar" : "Star"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(enquiry.id, "replied");
                              }}
                                    disabled={isUpdating}
                            >
                                    {isUpdating ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                              Mark as Replied
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(enquiry.id, "closed");
                              }}
                                    disabled={isUpdating}
                            >
                                    {isUpdating ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                                    )}
                              Close Enquiry
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                      handleDeleteClick(enquiry.id);
                              }}
                                    disabled={isDeleting}
                              className="text-destructive"
                            >
                                    {isDeleting ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                                    )}
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}

                        {enquiries.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                      <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No Enquiries Found
                      </h3>
                      <p className="text-muted-foreground">
                        {searchTerm ||
                              statusFilter !== "all" ||
                              categoryFilter !== "all"
                          ? "Try adjusting your search or filters."
                          : "No enquiries have been submitted yet."}
                      </p>
                    </div>
                        )}
                      </div>

                      {/* Pagination */}
                      {pagination.totalPages > 1 && (
                        <div className="flex-shrink-0 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                              {pagination.total} enquiries
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1 || isLoading}
                              >
                                Previous
                              </Button>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                  const page = i + 1;
                                  return (
                                    <Button
                                      key={page}
                                      variant={page === pagination.page ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handlePageChange(page)}
                                      disabled={isLoading}
                                      className="w-8 h-8 p-0"
                                    >
                                      {page}
                                    </Button>
                                  );
                                })}
                                {pagination.totalPages > 5 && (
                                  <span className="text-sm text-muted-foreground px-2">...</span>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages || isLoading}
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enquiry Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col"
        >
          <Card className="flex-1 flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Enquiry Details
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {selectedEnquiry ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-green/20 to-brand-teal/20 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-brand-green" />
                      </div>
                      <div>
                        <h3 className="font-medium">{selectedEnquiry.fullName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedEnquiry.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        {getStatusBadge(selectedEnquiry.status)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Category:</span>
                        <Badge variant="outline" className="capitalize">
                          {selectedEnquiry.inquiryCategory}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">IP Address:</span>
                        <span className="text-sm text-muted-foreground">
                          {selectedEnquiry.ipAddress}
                        </span>
                      </div>
                    </div>

                    {selectedEnquiry.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedEnquiry.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Submitted {formatDate(selectedEnquiry.createdAt)}
                      </span>
                    </div>

                    {selectedEnquiry.repliedAt && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Last reply {formatDate(selectedEnquiry.repliedAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Subject</h4>
                    <p className="text-sm">{selectedEnquiry.subject}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Message</h4>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedEnquiry.message}
                      </p>
                    </div>
                  </div>

                  {/* Replies Section */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Replies</h4>
                    {selectedEnquiry.replies && selectedEnquiry.replies.length > 0 ? (
                      <div className="space-y-3">
                        {selectedEnquiry.replies.map((reply, index) => (
                          <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="h-3 w-3 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-blue-900">
                                  {reply.adminName}
                                </span>
                                <span className="text-xs text-blue-600">
                                  {reply.adminEmail}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-blue-600">
                                <Clock className="h-3 w-3" />
                                {formatDate(reply.repliedAt)}
                              </div>
                            </div>
                            <div className="bg-white rounded border p-2">
                              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                {reply.replyMessage}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <Reply className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">No replies yet</p>
                        <p className="text-xs text-gray-400 mt-1">Send the first reply to this enquiry</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Dialog
                      open={isReplyDialogOpen}
                      onOpenChange={setIsReplyDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button 
                          className="flex-1 bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                          <Reply className="h-4 w-4 mr-2" />
                          )}
                          Reply
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Reply to {selectedEnquiry.fullName}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Your Reply
                            </label>
                            <Textarea
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              placeholder="Type your reply here..."
                              rows={6}
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => setIsReplyDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleReply}
                              disabled={!replyMessage.trim() || isUpdating}
                              className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                              <Reply className="h-4 w-4 mr-2" />
                              )}
                              {isUpdating ? "Sending..." : "Send Reply"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      onClick={() => handleStarToggle(selectedEnquiry.id)}
                    >
                      <Star
                        className={`h-4 w-4 ${selectedEnquiry.isStarred ? "text-yellow-500 fill-current" : ""}`}
                      />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Enquiry Selected
                  </h3>
                  <p className="text-muted-foreground">
                    Select an enquiry from the list to view details and respond.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Enquiry
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  Are you sure you want to delete this enquiry?
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone. The enquiry from{" "}
                  <span className="font-medium text-gray-900">
                    {enquiryToDelete?.fullName}
                  </span>{" "}
                  will be permanently removed.
                </p>
              </div>
            </div>

            {enquiryToDelete && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {enquiryToDelete.subject}
                  </p>
                  <p className="text-gray-500 mt-1">
                    {enquiryToDelete.email}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Submitted {formatDate(enquiryToDelete.createdAt)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Enquiry
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

            {/* Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Enquiries
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={exportDateRange === "today" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportDateRange("today")}
                  className="justify-start"
                >
                  Today
                </Button>
                <Button
                  variant={exportDateRange === "last7days" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportDateRange("last7days")}
                  className="justify-start"
                >
                  Last 7 Days
                </Button>
                <Button
                  variant={exportDateRange === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportDateRange("month")}
                  className="justify-start"
                >
                  This Month
                </Button>
                <Button
                  variant={exportDateRange === "year" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportDateRange("year")}
                  className="justify-start"
                >
                  This Year
                </Button>
                <Button
                  variant={exportDateRange === "custom" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportDateRange("custom")}
                  className="justify-start col-span-2"
                >
                  Custom Date Range
                </Button>
              </div>
            </div>

            {exportDateRange === "custom" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={exportCustomStartDate ? format(exportCustomStartDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined;
                      setExportCustomStartDate(date);
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
                    value={exportCustomEndDate ? format(exportCustomEndDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value + 'T23:59:59') : undefined;
                      setExportCustomEndDate(date);
                    }}
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                  />
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <Download className="h-3 w-3 text-blue-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Export Details</p>
                  <p className="text-blue-700 mt-1">
                    The CSV file will include: Customer Name, Email, Phone, Message, and Date of Contact.
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Options */}
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xs font-bold">⚡</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-green-900">Performance Options</p>
                    <p className="text-green-700 text-xs">
                      {useWebWorkers ? 'Web Workers enabled for faster decryption' : 'Main thread decryption'}
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={useWebWorkers}
                    onChange={(e) => setUseWebWorkers(e.target.checked)}
                    disabled={isExporting}
                    className="rounded border-gray-300"
                  />
                  <span className="text-green-700">Use Web Workers</span>
                </label>
              </div>
            </div>

            {isExporting && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate mr-2">{exportStage}</span>
                  <span className="font-medium flex-shrink-0">{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} className="w-full" />
                <div className="text-xs text-muted-foreground text-center">
                  {exportProgress === 100 ? "CSV file will download automatically..." : "Please wait while we securely process your data..."}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  if (!isExporting) {
                    setIsExportModalOpen(false);
                  }
                }}
                disabled={isExporting}
                size="sm"
              >
                {isExporting ? "Please Wait..." : "Cancel"}
              </Button>
              
              <Button
                onClick={exportEnquiries}
                disabled={isExporting || (exportDateRange === "custom" && (!exportCustomStartDate || !exportCustomEndDate))}
                className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
                size="sm"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {exportProgress === 100 ? "Downloading..." : "Exporting..."}
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
