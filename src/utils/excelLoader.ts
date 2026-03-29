import * as XLSX from 'xlsx';
import type { Opportunity, DashboardData } from '../types';

// Hard-coded quota for FY27
const FY27_QUOTA = 5_000_000;

export async function loadExcelData(filePath: string): Promise<DashboardData> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch Excel file: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
    
    const opportunities = jsonData.map((row: Record<string, unknown>, index: number): Opportunity => {
      // Parse dates from Excel columns (handles Excel serial numbers)
      const closeDate = parseDate(row['Close Date'] as string | number);
      const createdOn = parseDate(row['Created On'] as string | number);
      const modifiedOn = parseDate(row['Modified On'] as string | number);
      
      // Calculate age in days since Modified On (>60 days = aging deal)
      const ageInDays = calculateDaysSince(modifiedOn);
      
      // Parse revenue amounts - handle "Actual Revenu" (missing 'e')
      const estimatedRevenue = parseNumber(row['Estimated Revenue (TCV)']);
      const actualRevenue = parseNumber(row['Actual Revenu'] || row['Actual Revenue']);
      
      // Determine win status based on actual revenue > 0
      const isWon = actualRevenue > 0;
      
      // Get stage - normalize D365 stage names
      const stage = normalizeStage((row['Sales Stage'] || 'Qualification') as string);
      
      return {
        id: `OPP-${index + 1}`,
        name: (row['Opportunity Name'] || '') as string,
        accountName: (row['Account Name'] || '') as string,
        estimatedRevenue,
        actualRevenue,
        probability: parseNumber(row['Probability']),
        stage,
        closeDate,
        createdOn,
        modifiedOn,
        ageInDays,
        isWon,
        product: (row['Product'] || 'N/A') as string,
        description: (row['Description'] || '') as string,
        nextStep: (row['Next Step'] || '') as string,
        nextStepDueDate: parseDate(row['Next Step Due Date'] as string | number),
        timeline: (row['Timeline'] || '') as string,
        contact: (row['Contact'] || '') as string,
        rating: (row['Rating'] || '') as string,
        forecastCategory: (row['Forecast Category'] || '') as string,
      };
    });
    
    // Use hard-coded quota
    const quotaTarget = FY27_QUOTA;
    
    // Calculate weekly activities (opportunities modified in last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyActivities = opportunities.filter(o => {
      const modDate = new Date(o.modifiedOn);
      return modDate >= sevenDaysAgo;
    }).length;
    
    const totalEstimated = opportunities.reduce((sum, o) => sum + o.estimatedRevenue, 0);
    const totalWon = opportunities.reduce((s, o) => s + o.actualRevenue, 0);
    
    console.log(`✅ Loaded ${opportunities.length} opportunities from Excel`);
    console.log(`   FY27 Quota Target: $${(quotaTarget / 1000000).toFixed(2)}M`);
    console.log(`   Total Estimated Revenue (Pipeline): $${(totalEstimated / 1000000).toFixed(2)}M`);
    console.log(`   Total Actual Revenue (Won): $${(totalWon / 1000000).toFixed(2)}M`);
    
    return {
      opportunities,
      quotaTarget,
      weeklyActivities,
      lastUpdated: new Date().toLocaleString(),
    };
  } catch (error) {
    console.error('Error loading Excel file:', error);
    throw error;
  }
}

function parseDate(dateValue: string | number | undefined): string {
  if (!dateValue) return new Date().toISOString().split('T')[0];
  
  if (typeof dateValue === 'number') {
    // Excel date serial number (days since 1900-01-01)
    // Adjust for Excel's leap year bug
    const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
    const isoDate = excelDate.toISOString().split('T')[0];
    return isoDate;
  }
  
  if (typeof dateValue === 'string') {
    // Try to parse as ISO string first
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  }
  
  return new Date().toISOString().split('T')[0];
}

function parseNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function calculateDaysSince(dateString: string): number {
  try {
    const targetDate = new Date(dateString);
    const today = new Date();
    
    // Set both to midnight for accurate day calculation
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const timeDiff = today.getTime() - targetDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    return Math.max(0, daysDiff);
  } catch {
    return 0;
  }
}

function normalizeStage(stage: string): string {
  if (!stage) return 'Qualification';
  
  const normalized = stage.toLowerCase().trim();
  
  // Map D365 stage names exactly: Qualify, Develop, Propose, Close
  const stageMap: Record<string, string> = {
    // Qualify stage
    'qualify': 'Qualification',
    'qualification': 'Qualification',
    // Develop stage
    'develop': 'Develop',
    // Propose stage
    'propose': 'Proposal',
    'proposal': 'Proposal',
    // Close stage
    'close': 'Close',
    // Won/Lost (for completeness, but not used in funnel)
    'closed won': 'Won',
    'closedwon': 'Won',
    'closed-won': 'Won',
    'won': 'Won',
    'closed lost': 'Lost',
    'closedlost': 'Lost',
    'closed-lost': 'Lost',
    'lost': 'Lost',
  };
  return stageMap[normalized] || stage;
}
