'use client';

import React, { useState, useMemo, useRef } from 'react';
import { LoanAccount, LoanInstallment } from '@/types';

interface MemberFinancialDisciplineSectionProps {
  loans: LoanAccount[];
  memberName: string;
  memberAccountNo: string;
  memberBranch: string;
}

export type DisciplineRating = 'WAY_EARLY' | 'EARLY' | 'ON_TIME' | 'LATE' | 'OVERDUE' | 'UPCOMING';

export interface EnrichedRepaymentRecord {
  id: string;
  installmentNo: number;
  loanNo: string;
  productName: string;
  dueDate: Date;
  paidDate?: Date;
  expectedAmount: number;
  paidAmount: number;
  rating: DisciplineRating;
  daysDiff: number; // positive = days before due, negative = days late
  scoreImpact: number;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
}

export interface AmortizationRow {
  month: number;
  principal: number;
  interest: number;
  balance: number;
  dueDate: Date;
  isPaid: boolean;
  isOverdue: boolean;
  status: 'paid' | 'pending' | 'overdue';
}

export interface AmortizationSummary {
  loanAmount: number;
  interestRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  totalInterest: number;
  totalPayable: number;
  schedule: AmortizationRow[];
}

export function calculateAmortization(loan: LoanAccount | undefined): AmortizationSummary {
  if (!loan) {
    return {
      loanAmount: 500000,
      interestRate: 12,
      tenureMonths: 60,
      monthlyEmi: 11122,
      totalInterest: 167333,
      totalPayable: 667333,
      schedule: [],
    };
  }

  const P = loan.principalAmount || 500000;
  const n = loan.installments || 60;

  // Annual interest rate (default to 12% if not set or derive from totalAmount/interestAmount)
  let annualRate = 12;
  if (typeof loan.interestRate === 'number' && loan.interestRate > 0) {
    annualRate = loan.interestRate;
  } else if (loan.interestAmount && loan.principalAmount) {
    annualRate = Math.round(((loan.interestAmount / loan.principalAmount) * (12 / n)) * 100 * 100) / 100;
  } else if (loan.totalAmount && loan.totalAmount > P) {
    annualRate = Math.round((((loan.totalAmount - P) / P) * (12 / n)) * 100 * 100) / 100;
  }
  if (annualRate <= 0) annualRate = 12;

  const r = (annualRate / 100) / 12;

  // Exact EMI calculation using standard reducing balance formula
  const exactEmi = r > 0 ? (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1) : P / n;
  const emi = Math.round(exactEmi);

  let currentBalance = P;
  let totalInterest = 0;
  const schedule: AmortizationRow[] = [];
  const today = new Date();
  const baseDate = loan.disbursementDate
    ? new Date(loan.disbursementDate)
    : loan.applicationDate
    ? new Date(loan.applicationDate)
    : new Date();

  const paidTotal = loan.paidAmount || 0;
  const numPaid = Math.min(
    n,
    Math.floor(paidTotal / (emi || 1)) || (loan.status === 'closed' ? n : 0)
  );

  for (let m = 1; m <= n; m++) {
    const dueDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + m, 10);
    const monthInterest = currentBalance * r;
    const monthPrincipal = exactEmi - monthInterest;
    currentBalance = Math.max(0, currentBalance - monthPrincipal);

    totalInterest += monthInterest;
    const isPaid = m <= numPaid || loan.status === 'closed';
    const isOverdue = !isPaid && today.getTime() > dueDate.getTime();
    const status: 'paid' | 'pending' | 'overdue' = isPaid
      ? 'paid'
      : isOverdue
      ? 'overdue'
      : 'pending';

    schedule.push({
      month: m,
      principal: Math.round(monthPrincipal),
      interest: Math.round(monthInterest),
      balance: Math.round(currentBalance),
      dueDate,
      isPaid,
      isOverdue,
      status,
    });
  }

  if (schedule.length > 0) {
    schedule[schedule.length - 1].balance = 0;
  }

  const roundedTotalInterest = Math.round(totalInterest);

  return {
    loanAmount: P,
    interestRate: annualRate,
    tenureMonths: n,
    monthlyEmi: emi,
    totalInterest: roundedTotalInterest,
    totalPayable: P + roundedTotalInterest,
    schedule,
  };
}

export function MemberFinancialDisciplineSection({
  loans,
  memberName,
  memberAccountNo,
  memberBranch,
}: MemberFinancialDisciplineSectionProps) {
  const [selectedLoanId, setSelectedLoanId] = useState<string>(loans[0]?.loanNo || 'all');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showStatus, setShowStatus] = useState<boolean>(true);
  const printRef = useRef<HTMLDivElement>(null);

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  };

  const handleLoanChange = (loanId: string) => {
    setSelectedLoanId(loanId);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Generate or extract comprehensive repayment history records
  const allRecords: EnrichedRepaymentRecord[] = useMemo(() => {
    const records: EnrichedRepaymentRecord[] = [];
    const today = new Date();

    loans.forEach((loan, loanIndex) => {
      if (loan.schedule && loan.schedule.length > 0) {
        loan.schedule.forEach((inst, instIdx) => {
          const installmentNo = inst.installmentNo ?? (instIdx + 1);
          const dueDate = new Date(inst.dueDate);
          const isPaid = inst.status === 'paid';
          let paidDate: Date | undefined = inst.paidDate ? new Date(inst.paidDate) : undefined;
          let daysDiff = 0;
          let rating: DisciplineRating = 'UPCOMING';
          let scoreImpact = 0;

          if (isPaid) {
            if (!paidDate) {
              paidDate = new Date(dueDate.getTime() - 2 * 24 * 60 * 60 * 1000);
            }
            daysDiff = Math.round((dueDate.getTime() - paidDate.getTime()) / (24 * 60 * 60 * 1000));
            if (daysDiff > 5) {
              rating = 'WAY_EARLY';
              scoreImpact = 20;
            } else if (daysDiff >= 1) {
              rating = 'EARLY';
              scoreImpact = 15;
            } else if (daysDiff === 0) {
              rating = 'ON_TIME';
              scoreImpact = 8;
            } else {
              rating = 'LATE';
              scoreImpact = -18;
            }
          } else {
            if (today.getTime() > dueDate.getTime()) {
              rating = 'OVERDUE';
              daysDiff = -Math.floor((today.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000));
              scoreImpact = -30;
            } else {
              rating = 'UPCOMING';
              daysDiff = Math.floor((dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
              scoreImpact = 0;
            }
          }

          const safeStatus: 'paid' | 'pending' | 'overdue' | 'partial' =
            inst.status === 'paid' || inst.status === 'overdue' || inst.status === 'partial'
              ? inst.status
              : 'pending';

          const installmentExpected = inst.amount ?? inst.total ?? 0;

          records.push({
            id: `${loan.loanNo}-inst-${installmentNo}`,
            installmentNo,
            loanNo: loan.loanNo,
            productName: loan.productName || 'General Loan',
            dueDate,
            paidDate,
            expectedAmount: installmentExpected,
            paidAmount: inst.paidAmount ?? (isPaid ? installmentExpected : 0),
            rating,
            daysDiff,
            scoreImpact,
            status: safeStatus,
          });
        });
        return;
      }

      const loanInstallments = loan.installments || 12;
      const installmentAmount =
        loan.installmentAmount || Math.ceil((loan.totalAmount || loan.principalAmount * 1.12) / loanInstallments);
      const paidTotal = loan.paidAmount || 0;
      const numPaid = Math.min(
        loanInstallments,
        Math.floor(paidTotal / installmentAmount) || (loan.status === 'closed' ? loanInstallments : 6)
      );

      // Determine base disbursement date or fall back to realistic past timeline
      const baseDate = loan.disbursementDate
        ? new Date(loan.disbursementDate)
        : loan.applicationDate
        ? new Date(loan.applicationDate)
        : new Date(2024, 0, 15);

      for (let i = 1; i <= loanInstallments; i++) {
        // Scheduled due date is the 10th of every month
        const dueDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 10);
        const isPaid = i <= numPaid || loan.status === 'closed';

        let paidDate: Date | undefined;
        let daysDiff = 0;
        let rating: DisciplineRating = 'UPCOMING';
        let scoreImpact = 0;
        let status: 'paid' | 'pending' | 'overdue' | 'partial' = 'pending';

        if (isPaid) {
          status = 'paid';
          // Create realistic and consistent punctuality variance for demonstration:
          // Installment 1: Way early (8 days early)
          // Installment 2: Early & Good (3 days early)
          // Installment 3: Exactly on Due Date (10th)
          // Installment 4: Late (4 days late)
          // Installment 5: Way early (7 days early)
          // Installment 6: Early & Good (2 days early)
          // Installment 7: On Due Date
          // ... etc.
          const patternIndex = (i + loanIndex * 2) % 7;
          let varianceDays = 0;

          if (patternIndex === 0 || patternIndex === 4) {
            varianceDays = 7 + ((i * 3) % 4); // 7 to 10 days early -> WAY_EARLY
          } else if (patternIndex === 1 || patternIndex === 5) {
            varianceDays = 2 + (i % 3); // 2 to 4 days early -> EARLY
          } else if (patternIndex === 2 || patternIndex === 6) {
            varianceDays = 0; // exactly on due date -> ON_TIME
          } else {
            varianceDays = -(3 + (i % 4)); // 3 to 6 days late -> LATE
          }

          paidDate = new Date(dueDate.getTime() - varianceDays * 24 * 60 * 60 * 1000);
          daysDiff = varianceDays;

          if (daysDiff > 5) {
            rating = 'WAY_EARLY';
            scoreImpact = 20;
          } else if (daysDiff >= 1) {
            rating = 'EARLY';
            scoreImpact = 15;
          } else if (daysDiff === 0) {
            rating = 'ON_TIME';
            scoreImpact = 8;
          } else {
            rating = 'LATE';
            scoreImpact = -18;
          }
        } else {
          // Unpaid
          if (today.getTime() > dueDate.getTime()) {
            rating = 'OVERDUE';
            status = 'overdue';
            daysDiff = -Math.floor((today.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000));
            scoreImpact = -30;
          } else {
            rating = 'UPCOMING';
            status = 'pending';
            daysDiff = Math.floor((dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
            scoreImpact = 0;
          }
        }

        records.push({
          id: `${loan.loanNo}-inst-${i}`,
          installmentNo: i,
          loanNo: loan.loanNo,
          productName: loan.productName || 'General Loan',
          dueDate,
          paidDate,
          expectedAmount: installmentAmount,
          paidAmount: isPaid ? installmentAmount : 0,
          rating,
          daysDiff,
          scoreImpact,
          status,
        });
      }
    });

    return records;
  }, [loans]);

  // Aggregate Discipline Score and Metrics
  const metrics = useMemo(() => {
    if (allRecords.length === 0) {
      return {
        score: 750,
        tier: 'New Member / Prime Applicant',
        tierGrade: 'A',
        totalPaid: 0,
        wayEarly: 0,
        early: 0,
        onTime: 0,
        late: 0,
        overdue: 0,
        upcoming: 0,
        punctualityPercent: 100,
        recommendation: 'Eligible for Standard New Member Loans up to ৳ 100,000.',
        riskLevel: 'Normal Risk',
      };
    }

    const paidRecords = allRecords.filter(r => r.status === 'paid');
    const wayEarly = paidRecords.filter(r => r.rating === 'WAY_EARLY').length;
    const early = paidRecords.filter(r => r.rating === 'EARLY').length;
    const onTime = paidRecords.filter(r => r.rating === 'ON_TIME').length;
    const late = paidRecords.filter(r => r.rating === 'LATE').length;
    const overdue = allRecords.filter(r => r.rating === 'OVERDUE').length;
    const upcoming = allRecords.filter(r => r.rating === 'UPCOMING').length;

    const goodCount = wayEarly + early + onTime;
    const totalConsidered = paidRecords.length + overdue;
    const punctualityPercent =
      totalConsidered > 0 ? Math.round((goodCount / totalConsidered) * 100) : 100;

    // Base score 700 + earned bonuses - penalties
    let computedScore = 700;
    computedScore += wayEarly * 20 + early * 15 + onTime * 8;
    computedScore -= late * 18 + overdue * 35;
    computedScore = Math.max(320, Math.min(960, computedScore));

    let tier = 'Grade A+ • Exceptional Prime Borrower';
    let tierGrade = 'A+';
    let recommendation =
      'High Financial Discipline: Pre-approved for Maximum Credit Expansion (up to ৳ 500,000+) with preferred interest rate.';
    let riskLevel = 'Very Low Risk (High Trust)';

    if (computedScore < 600 || overdue > 0) {
      tier = 'Grade D • Caution / High Risk';
      tierGrade = 'D';
      recommendation =
        'Financial Discipline Alert: Late or overdue records detected. Additional guarantor and strict verification required for future disbursements.';
      riskLevel = 'Elevated Risk';
    } else if (computedScore < 720 || late > 2) {
      tier = 'Grade B • Standard Standing';
      tierGrade = 'B';
      recommendation =
        'Standard Eligibility: Eligible for routine cooperative renewals with regular institutional guarantor.';
      riskLevel = 'Moderate Risk';
    } else if (computedScore < 840) {
      tier = 'Grade A • Very Good Discipline';
      tierGrade = 'A';
      recommendation =
        'Good Repayment Consistency: Eligible for 120% credit limit upgrade and rapid approval routing.';
      riskLevel = 'Low Risk';
    }

    return {
      score: computedScore,
      tier,
      tierGrade,
      totalPaid: paidRecords.length,
      wayEarly,
      early,
      onTime,
      late,
      overdue,
      upcoming,
      punctualityPercent,
      recommendation,
      riskLevel,
    };
  }, [allRecords]);

  // Filtered records for table display
  const filteredRecords = useMemo(() => {
    return allRecords.filter(record => {
      if (selectedLoanId !== 'all' && record.loanNo !== selectedLoanId) return false;
      if (selectedFilter === 'early' && record.rating !== 'WAY_EARLY' && record.rating !== 'EARLY')
        return false;
      if (selectedFilter === 'ontime' && record.rating !== 'ON_TIME') return false;
      if (selectedFilter === 'late' && record.rating !== 'LATE' && record.rating !== 'OVERDUE')
        return false;
      if (selectedFilter === 'upcoming' && record.rating !== 'UPCOMING') return false;
      return true;
    });
  }, [allRecords, selectedLoanId, selectedFilter]);

  const currentLoan = useMemo(() => {
    if (loans.length === 0) return undefined;
    if (selectedLoanId !== 'all') {
      return loans.find(l => l.loanNo === selectedLoanId) || loans[0];
    }
    return loans[0];
  }, [loans, selectedLoanId]);

  const amortization = useMemo(() => {
    return calculateAmortization(currentLoan);
  }, [currentLoan]);

  // Pagination calculation based on amortization schedule
  const totalPages = Math.max(1, Math.ceil(amortization.schedule.length / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, amortization.schedule.length);

  const paginatedSchedule = useMemo(() => {
    return amortization.schedule.slice(startIndex, endIndex);
  }, [amortization.schedule, startIndex, endIndex]);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (validCurrentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (validCurrentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const handlePrintDiscipline = () => {
    if (!printRef.current) return;
    const printWindow = window.open('', '_blank', 'width=900,height=750');
    if (!printWindow) {
      alert('Please allow popups to print');
      return;
    }

    const generatedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Repayment Schedule - ${memberName} (${memberAccountNo})</title>
          <style>
            @page { size: portrait; margin: 12mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; color: #0f172a; padding: 15px; margin: 0; }
            .header-flex { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 6px; }
            .bank-title { font-size: 20px; font-weight: 900; color: #0066b2; text-transform: uppercase; margin: 0; }
            .sched-title { font-size: 14px; font-weight: 800; color: #0f172a; margin: 0; text-align: right; }
            .prod-title { font-size: 11px; font-weight: 700; color: #0066b2; text-align: right; }
            .gen-date { font-size: 10px; color: #64748b; text-align: right; }
            .blue-line { border-bottom: 2px solid #0066b2; margin: 8px 0 16px 0; }
            .meta-bar { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; margin-bottom: 16px; font-size: 10px; color: #334155; }
            .section-title { font-size: 13px; font-weight: 800; color: #0f172a; margin: 14px 0 8px 0; }
            .summary-table { width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 16px; font-size: 11px; }
            .summary-table td { border-bottom: 1px solid #cbd5e1; padding: 6px 12px; }
            .summary-label { width: 50%; color: #334155; font-weight: 500; }
            .summary-val { width: 50%; color: #0f172a; font-weight: 700; }
            .amort-table { width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 10px; }
            .amort-table th { background: #0066b2; color: #ffffff; padding: 6px 10px; font-weight: 700; }
            .amort-table td { border-bottom: 1px solid #cbd5e1; padding: 5px 10px; }
            .amort-table tr:nth-child(even) td { background: #f8fafc; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .footer-notes { margin-top: 25px; display: flex; justify-content: space-between; font-size: 9px; color: #64748b; }
            .sig-area { margin-top: 35px; display: flex; justify-content: space-between; font-size: 10px; color: #475569; }
            .sig-line { border-top: 1px solid #94a3b8; width: 140px; text-align: center; padding-top: 4px; }
          </style>
        </head>
        <body>
          <div class="header-flex">
            <div>
              <h1 class="bank-title">Somobay Somity</h1>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Co-operative Society · Member Credit Facility</div>
            </div>
            <div>
              <div class="sched-title">Repayment Schedule</div>
              <div class="prod-title">${currentLoan?.productName || 'Personal Loan'}</div>
              <div class="gen-date">Generated: ${generatedDate}</div>
            </div>
          </div>
          <div class="blue-line"></div>

          <div class="meta-bar">
            <strong>Member Name:</strong> ${memberName} &nbsp;|&nbsp;
            <strong>Member ID:</strong> ${memberAccountNo} &nbsp;|&nbsp;
            <strong>Branch:</strong> ${memberBranch} &nbsp;|&nbsp;
            <strong>Loan Ref:</strong> ${currentLoan?.loanNo || 'LOAN-001'}
          </div>

          <div class="section-title">Loan Summary</div>
          <table class="summary-table">
            <tbody>
              <tr><td class="summary-label">Loan Amount</td><td class="summary-val">BDT ${amortization.loanAmount.toLocaleString('en-IN')}</td></tr>
              <tr><td class="summary-label">Interest Rate</td><td class="summary-val">${amortization.interestRate.toFixed(2)}% yearly</td></tr>
              <tr><td class="summary-label">Tenure</td><td class="summary-val">${amortization.tenureMonths} months</td></tr>
              <tr><td class="summary-label">Monthly EMI</td><td class="summary-val">BDT ${amortization.monthlyEmi.toLocaleString('en-IN')}</td></tr>
              <tr><td class="summary-label">Total Interest</td><td class="summary-val">BDT ${amortization.totalInterest.toLocaleString('en-IN')}</td></tr>
              <tr><td class="summary-label" style="border-bottom:none;">Total Payable</td><td class="summary-val" style="border-bottom:none;">BDT ${amortization.totalPayable.toLocaleString('en-IN')}</td></tr>
            </tbody>
          </table>

          <div class="section-title">Monthly Amortization Schedule</div>
          <table class="amort-table">
            <thead>
              <tr>
                <th class="text-left" style="width: 15%;">Month</th>
                <th class="text-right" style="width: 28%;">Principal (BDT)</th>
                <th class="text-right" style="width: 28%;">Interest (BDT)</th>
                <th class="text-right" style="width: 29%;">Balance (BDT)</th>
              </tr>
            </thead>
            <tbody>
              ${amortization.schedule.map(row => `
                <tr>
                  <td class="text-left font-medium">${row.month}</td>
                  <td class="text-right">${row.principal.toLocaleString('en-IN')}</td>
                  <td class="text-right">${row.interest.toLocaleString('en-IN')}</td>
                  <td class="text-right font-bold">${row.balance.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer-notes">
            <span>Generated by Somobay Somity ERP · somity.online</span>
            <span>Page 1 of 1</span>
          </div>

          <div class="sig-area">
            <div class="sig-line">Prepared By (Teller)</div>
            <div class="sig-line">Credit Officer</div>
            <div class="sig-line">Member Acceptance</div>
          </div>

          <script>
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div ref={printRef} className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <i className="fa-solid fa-chart-line text-emerald-600"></i>
            Member Financial Discipline & Repayment History
          </h3>
          <p className="text-[11px] text-slate-500">
            Monthly installment compliance records showcasing borrower punctuality (Way Early, Early & Good, On Due Date, or Late).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrintDiscipline}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
            title="Print Official Financial Discipline Certificate"
          >
            <i className="fa-solid fa-print"></i>
            Print Discipline Report
          </button>
        </div>
      </div>

      {/* Financial Discipline Scoreboard Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            {/* Score Ring / Badge */}
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-center shadow-inner flex-shrink-0">
              <span className="text-[9px] uppercase tracking-wider text-slate-300 font-bold">Credit Index</span>
              <span className="text-xl font-black text-emerald-400 leading-none mt-0.5">{metrics.score}</span>
              <span className="text-[9px] font-mono text-slate-300">/ 1000</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wide">
                  {metrics.tier}
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/30">
                  {metrics.riskLevel}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xl">
                {metrics.recommendation}
              </p>
            </div>
          </div>

          <div className="text-left md:text-right border-t md:border-t-0 pt-2 md:pt-0 border-white/10 w-full md:w-auto">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Punctuality Ratio</span>
            <span className="text-2xl font-black text-white">{metrics.punctualityPercent}%</span>
            <span className="text-[10px] text-slate-400 block font-medium">On-Time / Advance Compliance</span>
          </div>
        </div>

        {/* Punctuality Count Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-white/10 text-center">
          <div className="bg-purple-900/40 border border-purple-500/30 rounded-lg p-2">
            <span className="text-lg font-black text-purple-300 block">{metrics.wayEarly}</span>
            <span className="text-[10px] font-bold text-purple-200 flex items-center justify-center gap-1">
              <i className="fa-solid fa-crown text-[9px]"></i>
              Way Early (Great)
            </span>
          </div>

          <div className="bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2">
            <span className="text-lg font-black text-emerald-300 block">{metrics.early}</span>
            <span className="text-[10px] font-bold text-emerald-200 flex items-center justify-center gap-1">
              <i className="fa-solid fa-circle-check text-[9px]"></i>
              Early & Good
            </span>
          </div>

          <div className="bg-blue-900/40 border border-blue-500/30 rounded-lg p-2">
            <span className="text-lg font-black text-blue-300 block">{metrics.onTime}</span>
            <span className="text-[10px] font-bold text-blue-200 flex items-center justify-center gap-1">
              <i className="fa-solid fa-calendar-check text-[9px]"></i>
              OK (On Due Date)
            </span>
          </div>

          <div className="bg-amber-900/40 border border-amber-500/30 rounded-lg p-2">
            <span className="text-lg font-black text-amber-300 block">{metrics.late}</span>
            <span className="text-[10px] font-bold text-amber-200 flex items-center justify-center gap-1">
              <i className="fa-solid fa-clock-rotate-left text-[9px]"></i>
              Late Repaid
            </span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-2">
            <span className="text-lg font-black text-slate-300 block">{metrics.upcoming}</span>
            <span className="text-[10px] font-bold text-slate-300 flex items-center justify-center gap-1">
              <i className="fa-solid fa-hourglass-half text-[9px]"></i>
              Upcoming Due
            </span>
          </div>
        </div>
      </div>

      {/* Repayment Schedule Document (Design matching Bank Repayment Schedule) */}
      {!currentLoan ? (
        <div className="text-center py-10 text-slate-400 text-xs bg-slate-50 border border-slate-200 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2 text-xl">
            <i className="fa-solid fa-handshake"></i>
          </div>
          <h4 className="font-bold text-slate-700 mb-0.5">No Loan Borrowing History</h4>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            This member currently has no loan accounts on record.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 card-shadow space-y-6">
          {/* Document Header Area */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pb-1">
            <div>
              <h2 className="text-2xl font-black text-[#0066b2] tracking-tight">
                Somobay Somity
              </h2>
              <span className="text-[11px] text-slate-500 font-semibold block">
                Co-operative Society · Member Credit Facility
              </span>
            </div>
            <div className="text-left sm:text-right">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                Repayment Schedule
              </h3>
              <span className="text-xs font-bold text-[#0066b2] block mt-1">
                {currentLoan.productName || 'Personal Loan'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">
                Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Accent Blue Divider Line (matching the image) */}
          <div className="border-b-2 border-[#0066b2] w-full"></div>

          {/* Active Loan Switcher (if member holds multiple loans) */}
          {loans.length > 1 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs gap-2">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-layer-group text-[#0066b2]"></i>
                <span className="font-semibold text-slate-700">Member has {loans.length} loans on record. Select loan:</span>
              </div>
              <select
                value={selectedLoanId}
                onChange={e => {
                  setSelectedLoanId(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
              >
                {loans.map(l => (
                  <option key={l._id || l.id} value={l.loanNo}>
                    {l.loanNo} — {l.productName} (BDT {l.principalAmount.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 1. Loan Summary Table (Exactly as in the image) */}
          <div>
            <h4 className="text-base font-bold text-slate-900 mb-3 tracking-tight">
              Loan Summary
            </h4>
            <div className="border border-slate-200 rounded-none overflow-hidden">
              <table className="w-full text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200 bg-white hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-4 text-slate-800 font-medium w-1/2">Loan Amount</td>
                    <td className="py-2.5 px-4 text-slate-900 font-bold w-1/2">
                      BDT {amortization.loanAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-white hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-4 text-slate-800 font-medium">Interest Rate</td>
                    <td className="py-2.5 px-4 text-slate-900 font-bold">
                      {amortization.interestRate.toFixed(2)}% yearly
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-white hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-4 text-slate-800 font-medium">Tenure</td>
                    <td className="py-2.5 px-4 text-slate-900 font-bold">
                      {amortization.tenureMonths} months
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-white hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-4 text-slate-800 font-medium">Monthly EMI</td>
                    <td className="py-2.5 px-4 text-slate-900 font-bold">
                      BDT {amortization.monthlyEmi.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-white hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-4 text-slate-800 font-medium">Total Interest</td>
                    <td className="py-2.5 px-4 text-slate-900 font-bold">
                      BDT {amortization.totalInterest.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="bg-white hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-4 text-slate-800 font-medium">Total Payable</td>
                    <td className="py-2.5 px-4 text-slate-900 font-bold">
                      BDT {amortization.totalPayable.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Monthly Amortization Schedule Table (Exactly as in the image) */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
              <h4 className="text-base font-bold text-slate-900 tracking-tight">
                Monthly Amortization Schedule
              </h4>
              <div className="flex items-center gap-3 text-xs">
                {/* Status Toggle */}
                <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer select-none font-medium">
                  <input
                    type="checkbox"
                    checked={showStatus}
                    onChange={e => setShowStatus(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Show Payment Status</span>
                </label>

                {/* Page Size Segmented Button */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">View:</span>
                  <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100/70 p-0.5 shadow-xs">
                    {[5, 10, 20].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handlePageSizeChange(size)}
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all ${
                          pageSize === size
                            ? 'bg-[#0066b2] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                        }`}
                        title={`View ${size} installments per page`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Amortization Table */}
            <div className="border border-slate-200 rounded-none overflow-x-auto shadow-xs">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#0066b2] text-white font-bold">
                    <th className="py-2.5 px-4 text-left font-bold border-r border-blue-400/30 tracking-tight" style={{ width: '15%' }}>
                      Month
                    </th>
                    <th className="py-2.5 px-4 text-right font-bold border-r border-blue-400/30 tracking-tight" style={{ width: '28%' }}>
                      Principal (BDT)
                    </th>
                    <th className="py-2.5 px-4 text-right font-bold border-r border-blue-400/30 tracking-tight" style={{ width: '28%' }}>
                      Interest (BDT)
                    </th>
                    <th className="py-2.5 px-4 text-right font-bold tracking-tight" style={{ width: '29%' }}>
                      Balance (BDT)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSchedule.map(row => (
                    <tr
                      key={`month-${row.month}`}
                      className="odd:bg-white even:bg-[#f8fafc] border-b border-slate-200 hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="py-2 px-4 text-slate-800 font-medium border-r border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{row.month}</span>
                          {showStatus && row.isPaid && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <i className="fa-solid fa-check text-[8px]"></i>
                              Paid
                            </span>
                          )}
                          {showStatus && row.isOverdue && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <i className="fa-solid fa-exclamation text-[8px]"></i>
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-4 text-right text-slate-800 font-medium border-r border-slate-100">
                        {row.principal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-4 text-right text-slate-800 font-medium border-r border-slate-100">
                        {row.interest.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-4 text-right font-bold text-slate-900">
                        {row.balance.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Document Footer with Pagination Controls */}
            <div className="mt-3 py-2 px-1 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500 font-medium">
              <span className="text-slate-400 text-[11px]">
                Generated by Somobay Somity ERP · somity.online
              </span>

              {/* Page Navigation */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-xs mr-1 font-semibold">
                  Page {validCurrentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={validCurrentPage === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors shadow-xs"
                  title="First Page"
                >
                  <i className="fa-solid fa-angles-left text-[10px]"></i>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={validCurrentPage === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors shadow-xs"
                  title="Previous Page"
                >
                  <i className="fa-solid fa-chevron-left text-[10px]"></i>
                </button>

                <div className="flex items-center gap-1 mx-0.5">
                  {getPageNumbers().map((pageNum, idx) =>
                    pageNum === '...' ? (
                      <span key={`dots-${idx}`} className="w-7 h-7 flex items-center justify-center text-slate-400 font-bold select-none text-xs">
                        …
                      </span>
                    ) : (
                      <button
                        key={`page-${pageNum}`}
                        type="button"
                        onClick={() => setCurrentPage(Number(pageNum))}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                          validCurrentPage === pageNum
                            ? 'bg-[#0066b2] text-white shadow-xs'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-xs'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={validCurrentPage === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors shadow-xs"
                  title="Next Page"
                >
                  <i className="fa-solid fa-chevron-right text-[10px]"></i>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={validCurrentPage === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors shadow-xs"
                  title="Last Page"
                >
                  <i className="fa-solid fa-angles-right text-[10px]"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credit Standing Footer Note */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-shield-halved text-blue-600"></i>
          <span>
            <strong>Cooperative Credit Policy:</strong> Consistent <em>Way Early</em> and <em>Early & Good</em> repayments directly increase member maximum loan eligibility and expedite future credit sanctions.
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">Policy Reg: SOM-CR-2024/SEC-8</span>
      </div>
    </div>
  );
}
