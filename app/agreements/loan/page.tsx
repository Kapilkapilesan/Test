"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    FileText,
    Search,
    Eye,
    Printer,
    Lock,
    Unlock,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    RefreshCw,
    Download,
    ChevronLeft,
    ChevronRight,
    Filter,
    User,
    Calendar,
    DollarSign,
    Building2
} from "lucide-react";
import { toast } from "react-toastify";
import { loanAgreementService, LoanWithAgreement } from "@/services/loanAgreement.service";
import { documentPrintLogService } from "@/services/documentPrintLog.service";
import { authService } from "@/services/auth.service";
import LoanAgreementPrintDocument from "@/components/loan/LoanAgreementPrintDocument";

type PrintStatus = 'all' | 'printed' | 'not_printed' | 'pending_reprint';

export default function LoanAgreementPage() {
    const [loans, setLoans] = useState<LoanWithAgreement[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [printStatus, setPrintStatus] = useState<PrintStatus>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedLoan, setSelectedLoan] = useState<LoanWithAgreement | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showReprintModal, setShowReprintModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [reprintReason, setReprintReason] = useState("");
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchLoans = useCallback(async () => {
        try {
            setLoading(true);
            const response = await loanAgreementService.getLoans({
                search,
                print_status: printStatus,
                page: currentPage,
                per_page: 15
            });
            setLoans(response.data);
            setTotalPages(response.meta.last_page);
            setTotal(response.meta.total);
        } catch (error: any) {
            toast.error(error.message || "Failed to load loan agreements");
        } finally {
            setLoading(false);
        }
    }, [search, printStatus, currentPage]);

    useEffect(() => {
        fetchLoans();
    }, [fetchLoans]);

    const handleView = async (loan: LoanWithAgreement) => {
        try {
            const response = await loanAgreementService.getLoan(loan.id);
            setSelectedLoan(response.data);
            setShowViewModal(true);
        } catch (error: any) {
            toast.error(error.message || "Failed to load loan details");
        }
    };

    const handlePrintRequest = async (loan: LoanWithAgreement) => {
        // Check if locked and needs reprint request
        if (loan.agreement?.is_locked && !loan.agreement?.reprint_approved) {
            setSelectedLoan(loan);
            setShowReprintModal(true);
            return;
        }

        // Show preview first
        setSelectedLoan(loan);
        setShowPreviewModal(true);
    };

    const handleConfirmPrint = async () => {
        if (!selectedLoan) return;
        // Trigger print, then mark as printed
        handlePrintPreview();

        try {
            setActionLoading(selectedLoan.id);
            await loanAgreementService.markPrinted(selectedLoan.id);

            // Record in global print logs
            await documentPrintLogService.recordLog({
                document_type: 'loan_agreement',
                document_id: selectedLoan.contract_number,
                action: 'print',
                status: 'success',
                print_count: (selectedLoan.agreement?.print_count || 0) + 1,
                metadata: {
                    loan_id: selectedLoan.id,
                    contract_number: selectedLoan.contract_number,
                    customer_name: selectedLoan.customer.full_name
                }
            });

            toast.success("Loan agreement printed and recorded successfully");
            setShowPreviewModal(false);
            fetchLoans(); // Refresh to show updated print status
        } catch (error: any) {
            toast.error(error.message || "Failed to record print status");
        } finally {
            setActionLoading(null);
            setSelectedLoan(null);
        }
    };

    const handleRequestReprint = async () => {
        if (!selectedLoan || !reprintReason.trim()) {
            toast.error("Please provide a reason for the reprint request");
            return;
        }

        try {
            setActionLoading(selectedLoan.id);
            await loanAgreementService.requestReprint(selectedLoan.id, reprintReason);
            toast.success("Reprint request submitted. Awaiting manager approval.");
            setShowReprintModal(false);
            setReprintReason("");
            setSelectedLoan(null);
            fetchLoans();
        } catch (error: any) {
            toast.error(error.message || "Failed to submit reprint request");
        } finally {
            setActionLoading(null);
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm("Are you sure you want to approve this reprint request?")) return;
        try {
            setActionLoading(id);
            await loanAgreementService.approveReprint(id);
            toast.success("Reprint request approved");
            fetchLoans();
        } catch (error: any) {
            toast.error(error.message || "Failed to approve request");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm("Are you sure you want to reject this reprint request?")) return;
        try {
            setActionLoading(id);
            await loanAgreementService.rejectReprint(id);
            toast.success("Reprint request rejected");
            fetchLoans();
        } catch (error: any) {
            toast.error(error.message || "Failed to reject request");
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (loan: LoanWithAgreement) => {
        const agreement = loan.agreement;

        if (!agreement || !agreement.is_printed) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    <FileText className="w-3 h-3" />
                    Not Printed
                </span>
            );
        }

        if (agreement.reprint_requested && !agreement.reprint_approved) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <Clock className="w-3 h-3" />
                    Reprint Pending
                </span>
            );
        }

        if (agreement.reprint_approved) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <Unlock className="w-3 h-3" />
                    Reprint Approved
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <Lock className="w-3 h-3" />
                Printed ({agreement.print_count}x)
            </span>
        );
    };

    const canPrint = (loan: LoanWithAgreement): boolean => {
        const agreement = loan.agreement;
        if (!agreement || !agreement.is_printed) return true;
        if (agreement.is_locked && agreement.reprint_approved) return true;
        return false;
    };

    const getPrintButtonState = (loan: LoanWithAgreement) => {
        const agreement = loan.agreement;

        if (!agreement || !agreement.is_printed) {
            return { text: "Print", icon: <Printer className="w-4 h-4" />, variant: "primary" };
        }

        if (agreement.reprint_requested && !agreement.reprint_approved) {
            return { text: "Pending", icon: <Clock className="w-4 h-4" />, variant: "disabled" };
        }

        if (agreement.reprint_approved) {
            return { text: "Reprint", icon: <RefreshCw className="w-4 h-4" />, variant: "success" };
        }

        return { text: "Request Reprint", icon: <Lock className="w-4 h-4" />, variant: "warning" };
    };

    const handlePrintPreview = () => {
        const printContent = document.getElementById('loan-print-container');
        if (!printContent) return;

        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Loan Agreement - ${selectedLoan?.contract_number}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Tamil:wght@400;700&display=swap" rel="stylesheet">
                    <style>
                        @page {
                            size: A4;
                            margin: 0;
                        }
                        @media print {
                            body { 
                                background: white !important; 
                                margin: 0 !important;
                                padding: 0 !important;
                            }
                            .print-page { 
                                margin: 0 !important; 
                                box-shadow: none !important; 
                                border: none !important;
                                page-break-after: always;
                            }
                            .print-page:last-child {
                                page-break-after: auto;
                            }
                        }
                        @media screen {
                            body { 
                                background: #e5e7eb; 
                                padding: 20px; 
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                gap: 30px;
                            }
                            .print-page {
                                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                                border: 1px solid #d1d5db;
                            }
                        }
                        body { font-family: 'Times New Roman', 'Noto Serif Tamil', serif; color: #000; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                    <script>
                        window.onload = () => {
                            setTimeout(() => {
                                window.print();
                            }, 1500);
                        };
                    <\/script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-7 h-7 text-primary-600" />
                        Loan Agreements
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Print loan agreements for approved loans
                    </p>
                </div>
                <button
                    onClick={fetchLoans}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by loan ID, contract number, or customer name..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Print Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={printStatus}
                            onChange={(e) => {
                                setPrintStatus(e.target.value as PrintStatus);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Status</option>
                            <option value="not_printed">Not Printed</option>
                            <option value="printed">Printed</option>
                            <option value="pending_reprint">Pending Reprint</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Contract No.
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Agreement Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Print Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Printed By
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                                            <p className="text-gray-500">Loading...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : loans.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                            <p className="text-gray-500 dark:text-gray-400">No approved loans found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                loans.map((loan) => {
                                    const btnState = getPrintButtonState(loan);
                                    return (
                                        <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {loan.contract_number}
                                                </div>
                                                <div className="text-xs text-gray-500">ID: {loan.loan_id}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {loan.customer?.full_name || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {loan.customer?.customer_code}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    Rs. {Number(loan.approved_amount || loan.request_amount).toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {loan.terms} weeks
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                {loan.agreement_date ? new Date(loan.agreement_date).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(loan)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm">
                                                {loan.agreement?.printed_by_user?.full_name || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleView(loan)}
                                                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>

                                                    {loan.agreement?.reprint_requested && !loan.agreement?.reprint_approved && authService.hasPermission('loan_agreements.approve_reprint') && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(loan.id)}
                                                                disabled={actionLoading === loan.id}
                                                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-lg transition-colors"
                                                                title="Approve Reprint"
                                                            >
                                                                <CheckCircle className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(loan.id)}
                                                                disabled={actionLoading === loan.id}
                                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                                                title="Reject Reprint"
                                                            >
                                                                <XCircle className="w-5 h-5" />
                                                            </button>
                                                        </>
                                                    )}

                                                    <button
                                                        onClick={() => handlePrintRequest(loan)}
                                                        disabled={actionLoading === loan.id || (btnState.variant === 'disabled' && !authService.hasPermission('loan_agreements.approve_reprint'))}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${btnState.variant === 'primary'
                                                            ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                                            : btnState.variant === 'success'
                                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                                : btnState.variant === 'warning'
                                                                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            } ${actionLoading === loan.id ? 'opacity-50' : ''}`}
                                                    >
                                                        {actionLoading === loan.id ? (
                                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            btnState.icon
                                                        )}
                                                        {btnState.text}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing page {currentPage} of {totalPages} ({total} total)
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Details Modal */}
            {showViewModal && selectedLoan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Loan Agreement Details
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        setSelectedLoan(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                            {/* Loan Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase">Contract Number</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{selectedLoan.contract_number}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase">Agreement Date</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {selectedLoan.agreement_date ? new Date(selectedLoan.agreement_date).toLocaleDateString() : '-'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase">Loan Amount</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        Rs. {Number(selectedLoan.approved_amount || selectedLoan.request_amount).toLocaleString()}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase">Terms</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{selectedLoan.terms} weeks</p>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Customer Details
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Full Name</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedLoan.customer?.full_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">NIC</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedLoan.customer?.customer_code}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Joint Borrower */}
                            {selectedLoan.guardian_name && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Joint Borrower</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Full Name</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedLoan.guardian_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">NIC</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedLoan.guardian_nic}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Print History */}
                            {selectedLoan.agreement && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Printer className="w-4 h-4" />
                                        Print History
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Status</span>
                                            {getStatusBadge(selectedLoan)}
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Print Count</span>
                                            <span className="font-medium">{selectedLoan.agreement.print_count}x</span>
                                        </div>
                                        {selectedLoan.agreement.printed_at && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Last Printed</span>
                                                <span className="font-medium">
                                                    {new Date(selectedLoan.agreement.printed_at).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        {selectedLoan.agreement.printed_by_user && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Printed By</span>
                                                <span className="font-medium">{selectedLoan.agreement.printed_by_user.full_name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedLoan(null);
                                }}
                                className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    handlePrintRequest(selectedLoan);
                                }}
                                disabled={!canPrint(selectedLoan)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download className="w-4 h-4" />
                                Download Agreement
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reprint Request Modal */}
            {showReprintModal && selectedLoan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                    <Lock className="w-5 h-5 text-amber-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Request Reprint
                                </h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-amber-700 dark:text-amber-300">
                                        <p className="font-medium">This agreement has already been printed.</p>
                                        <p className="mt-1">To print again, you need manager approval. Please provide a reason for the reprint request.</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Reason for Reprint *
                                </label>
                                <textarea
                                    value={reprintReason}
                                    onChange={(e) => setReprintReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Enter the reason for reprinting..."
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowReprintModal(false);
                                    setReprintReason("");
                                    setSelectedLoan(null);
                                }}
                                className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRequestReprint}
                                disabled={!reprintReason.trim() || actionLoading === selectedLoan.id}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading === selectedLoan.id ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Clock className="w-4 h-4" />
                                )}
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Print Preview Modal */}
            {showPreviewModal && selectedLoan && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                    <Printer className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Document Preview
                                    </h2>
                                    <p className="text-xs text-gray-500">Verify details before downloading</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrintPreview}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-primary-600"
                                    title="Print Documents"
                                >
                                    <Printer className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPreviewModal(false);
                                        setSelectedLoan(null);
                                    }}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <XCircle className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body - Multi-Page Scrolling Preview */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-200 dark:bg-gray-900">
                            <div className="flex flex-col gap-8 items-center max-w-[850px] mx-auto">
                                <LoanAgreementPrintDocument loan={selectedLoan} />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-amber-600">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="text-sm font-medium">Please check values carefully</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowPreviewModal(false);
                                        setSelectedLoan(null);
                                    }}
                                    className="px-6 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium border border-gray-300 dark:border-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmPrint}
                                    disabled={actionLoading === selectedLoan.id}
                                    className="inline-flex items-center gap-2 px-8 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all shadow-lg active:transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                                >
                                    {actionLoading === selectedLoan.id ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Printer className="w-5 h-5" />
                                    )}
                                    Confirm & Print
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}
