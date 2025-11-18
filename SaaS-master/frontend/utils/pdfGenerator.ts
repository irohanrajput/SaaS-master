import jsPDF from 'jspdf'

interface AnalysisData {
  domain?: string
  overall_score?: number
  breakdown?: {
    technical?: number
    user_experience?: number
    seo_health?: number
  }
  timestamp?: string
}

interface LighthouseData {
  categoryScores?: {
    performance?: number
    accessibility?: number
    bestPractices?: number
    seo?: number
  }
  coreWebVitals?: {
    lcp?: { displayValue?: string; score?: number }
    fid?: { displayValue?: string; score?: number }
    cls?: { displayValue?: string; score?: number }
    fcp?: { displayValue?: string; score?: number }
  }
  opportunities?: Array<{
    title?: string
    savings?: number
    description?: string
  }>
}

interface QuickWin {
  title: string
  description: string
  impact: string
  category: string
}

export const generatePDFReport = async (
  analysisResult: AnalysisData | null,
  lighthouseData: LighthouseData | null,
  quickWins: QuickWin[]
) => {
  if (!analysisResult && !lighthouseData) {
    alert('No analysis data available. Please analyze a website first.')
    return
  }

  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let yPosition = 20

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      pdf.addPage()
      yPosition = 20
    }
  }

  // Add logo/header
  pdf.setFontSize(28)
  pdf.setTextColor(255, 107, 0) // Claryx orange
  pdf.text('CLARYX', 20, yPosition)
  
  pdf.setFontSize(11)
  pdf.setTextColor(100, 100, 100)
  pdf.text('SEO Analysis Report', 20, yPosition + 8)
  
  yPosition += 22

  // Add domain and date
  pdf.setFontSize(12)
  pdf.setTextColor(0, 0, 0)
  if (analysisResult?.domain) {
    pdf.text(`Website: ${analysisResult.domain}`, 20, yPosition)
    yPosition += 7
  }
  
  if (analysisResult?.timestamp) {
    pdf.setFontSize(9)
    pdf.setTextColor(120, 120, 120)
    pdf.text(`Generated: ${new Date(analysisResult.timestamp).toLocaleString()}`, 20, yPosition)
    yPosition += 12
  }

  // Add horizontal line
  pdf.setDrawColor(220, 220, 220)
  pdf.setLineWidth(0.5)
  pdf.line(20, yPosition, pageWidth - 20, yPosition)
  yPosition += 12

  // Overall Score
  if (analysisResult?.overall_score !== undefined) {
    pdf.setFontSize(18)
    pdf.setTextColor(0, 0, 0)
    pdf.text('Overall SEO Health Score', 20, yPosition)
    yPosition += 12

    pdf.setFontSize(48)
    const scoreColor = analysisResult.overall_score >= 80 ? [34, 197, 94] : 
                       analysisResult.overall_score >= 50 ? [249, 115, 22] : [239, 68, 68]
    pdf.setTextColor(...scoreColor)
    pdf.text(`${analysisResult.overall_score}`, 20, yPosition)
    
    pdf.setFontSize(28)
    pdf.setTextColor(180, 180, 180)
    pdf.text('/100', 48, yPosition)
    
    const label = analysisResult.overall_score >= 80 ? 'Good' : 
                  analysisResult.overall_score >= 50 ? 'Needs Improvement' : 'Poor'
    pdf.setFontSize(12)
    pdf.setTextColor(...scoreColor)
    pdf.text(label, 20, yPosition + 7)
    
    yPosition += 20
  }

  checkNewPage(30)

  // Score Breakdown
  if (analysisResult?.breakdown) {
    pdf.setFontSize(16)
    pdf.setTextColor(0, 0, 0)
    pdf.text('Score Breakdown', 20, yPosition)
    yPosition += 10

    Object.entries(analysisResult.breakdown).forEach(([key, value]) => {
      checkNewPage(15)
      
      pdf.setFontSize(11)
      pdf.setTextColor(60, 60, 60)
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      pdf.text(`${label}:`, 20, yPosition)
      
      const scoreColor = value >= 80 ? [34, 197, 94] : value >= 50 ? [249, 115, 22] : [239, 68, 68]
      pdf.setFontSize(11)
      pdf.setTextColor(...scoreColor)
      pdf.setFont(undefined, 'bold')
      pdf.text(`${value}/100`, 110, yPosition)
      pdf.setFont(undefined, 'normal')
      
      // Progress bar background
      pdf.setFillColor(240, 240, 240)
      pdf.rect(20, yPosition + 2, 100, 4, 'F')
      
      // Progress bar fill
      pdf.setFillColor(...scoreColor)
      pdf.rect(20, yPosition + 2, (value / 100) * 100, 4, 'F')
      
      yPosition += 12
    })
    yPosition += 8
  }

  checkNewPage(40)

  // Lighthouse Categories
  if (lighthouseData?.categoryScores) {
    pdf.setFontSize(16)
    pdf.setTextColor(0, 0, 0)
    pdf.text('Lighthouse Categories', 20, yPosition)
    yPosition += 10

    Object.entries(lighthouseData.categoryScores).forEach(([key, value]) => {
      if (value !== undefined) {
        checkNewPage(10)
        
        pdf.setFontSize(10)
        pdf.setTextColor(80, 80, 80)
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        pdf.text(`${label}:`, 20, yPosition)
        
        const scoreColor = value >= 80 ? [34, 197, 94] : value >= 50 ? [249, 115, 22] : [239, 68, 68]
        pdf.setTextColor(...scoreColor)
        pdf.setFont(undefined, 'bold')
        pdf.text(`${value}/100`, 110, yPosition)
        pdf.setFont(undefined, 'normal')
        
        yPosition += 8
      }
    })
    yPosition += 8
  }

  // Core Web Vitals
  if (lighthouseData?.coreWebVitals) {
    checkNewPage(40)

    pdf.setFontSize(16)
    pdf.setTextColor(0, 0, 0)
    pdf.text('Core Web Vitals', 20, yPosition)
    yPosition += 10

    const vitals = lighthouseData.coreWebVitals
    
    if (vitals.lcp) {
      pdf.setFontSize(10)
      pdf.setTextColor(80, 80, 80)
      pdf.text('Largest Contentful Paint (LCP):', 20, yPosition)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text(vitals.lcp.displayValue || 'N/A', 110, yPosition)
      pdf.setFont(undefined, 'normal')
      yPosition += 7
    }
    
    if (vitals.fid) {
      pdf.setTextColor(80, 80, 80)
      pdf.text('First Input Delay (FID):', 20, yPosition)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text(vitals.fid.displayValue || 'N/A', 110, yPosition)
      pdf.setFont(undefined, 'normal')
      yPosition += 7
    }
    
    if (vitals.cls) {
      pdf.setTextColor(80, 80, 80)
      pdf.text('Cumulative Layout Shift (CLS):', 20, yPosition)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text(vitals.cls.displayValue || 'N/A', 110, yPosition)
      pdf.setFont(undefined, 'normal')
      yPosition += 7
    }
    
    if (vitals.fcp) {
      pdf.setTextColor(80, 80, 80)
      pdf.text('First Contentful Paint (FCP):', 20, yPosition)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text(vitals.fcp.displayValue || 'N/A', 110, yPosition)
      pdf.setFont(undefined, 'normal')
      yPosition += 7
    }
    
    yPosition += 8
  }

  // Quick Wins
  if (quickWins.length > 0) {
    checkNewPage(40)

    pdf.setFontSize(16)
    pdf.setTextColor(0, 0, 0)
    pdf.text(`Top ${quickWins.length} Quick Wins`, 20, yPosition)
    yPosition += 10

    quickWins.forEach((win, index) => {
      checkNewPage(30)

      pdf.setFontSize(11)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text(`${index + 1}. ${win.title}`, 20, yPosition)
      pdf.setFont(undefined, 'normal')
      yPosition += 6

      pdf.setFontSize(9)
      pdf.setTextColor(100, 100, 100)
      const descriptionLines = pdf.splitTextToSize(win.description, pageWidth - 50)
      pdf.text(descriptionLines, 25, yPosition)
      yPosition += descriptionLines.length * 4.5

      pdf.setFontSize(8)
      const impactColor = win.impact === 'high' ? [239, 68, 68] : 
                         win.impact === 'medium' ? [249, 115, 22] : [59, 130, 246]
      pdf.setTextColor(...impactColor)
      pdf.text(`Impact: ${win.impact.toUpperCase()}`, 25, yPosition)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`| Category: ${win.category}`, 60, yPosition)
      yPosition += 10
    })
  }

  // Performance Opportunities
  if (lighthouseData?.opportunities && lighthouseData.opportunities.length > 0) {
    checkNewPage(40)

    pdf.setFontSize(16)
    pdf.setTextColor(0, 0, 0)
    pdf.text('Performance Opportunities', 20, yPosition)
    yPosition += 10

    lighthouseData.opportunities.slice(0, 5).forEach((opp, index) => {
      checkNewPage(25)

      pdf.setFontSize(10)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text(`${index + 1}. ${opp.title || 'Optimization'}`, 20, yPosition)
      pdf.setFont(undefined, 'normal')
      yPosition += 6

      if (opp.savings) {
        pdf.setFontSize(9)
        pdf.setTextColor(249, 115, 22)
        pdf.text(`Potential savings: ${Math.round(opp.savings / 1000)}s`, 25, yPosition)
        yPosition += 6
      }

      if (opp.description) {
        pdf.setFontSize(8)
        pdf.setTextColor(100, 100, 100)
        const descLines = pdf.splitTextToSize(opp.description.substring(0, 150), pageWidth - 50)
        pdf.text(descLines, 25, yPosition)
        yPosition += descLines.length * 4
      }
      yPosition += 7
    })
  }

  // Footer on all pages
  const totalPages = (pdf as any).internal.pages.length - 1
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    pdf.text(
      `Page ${i} of ${totalPages}`,
      20,
      pageHeight - 10
    )
    pdf.text(
      'Generated by CLARYX',
      pageWidth - 20,
      pageHeight - 10,
      { align: 'right' }
    )
  }

  // Save PDF
  const fileName = `claryx-seo-report-${analysisResult?.domain || 'analysis'}-${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(fileName)
}