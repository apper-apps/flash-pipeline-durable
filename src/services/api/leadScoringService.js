import engagementData from "@/services/mockData/engagementData.json";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";

let engagements = [...engagementData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Scoring configuration
const SCORING_WEIGHTS = {
  emailOpens: 10,
  websiteVisits: 15,
  formSubmissions: 25,
  dealSize: 0.0001, // Per dollar
  recency: 20, // Bonus for recent activity
  frequency: 30 // Bonus for frequent activity
};

const TEMPERATURE_THRESHOLDS = {
  hot: 80,
  warm: 50,
  cold: 0
};

export const leadScoringService = {
  async calculateLeadScore(contactId) {
    await delay(200);
    
    const contactEngagements = engagements.filter(e => e.contactId === contactId);
    const now = new Date();
    
    let score = 0;
    
    // Email engagement scoring
    const emailOpens = contactEngagements.filter(e => e.type === 'email_open');
    score += emailOpens.length * SCORING_WEIGHTS.emailOpens;
    
    // Website visit scoring
    const websiteVisits = contactEngagements.filter(e => e.type === 'website_visit');
    score += websiteVisits.length * SCORING_WEIGHTS.websiteVisits;
    
    // Form submission scoring
    const formSubmissions = contactEngagements.filter(e => e.type === 'form_submission');
    score += formSubmissions.length * SCORING_WEIGHTS.formSubmissions;
    
    // Deal size potential scoring
    try {
      const deals = await dealService.getAll();
      const contactDeals = deals.filter(d => d.contactId === contactId);
      const avgDealSize = contactDeals.length > 0 
        ? contactDeals.reduce((sum, deal) => sum + deal.value, 0) / contactDeals.length
        : 25000; // Default expected deal size
      
      score += avgDealSize * SCORING_WEIGHTS.dealSize;
    } catch (error) {
      console.warn('Error calculating deal size score:', error);
    }
    
    // Recency scoring - bonus for recent activity
    const recentEngagements = contactEngagements.filter(e => {
      const engagementDate = new Date(e.timestamp);
      const daysDiff = (now - engagementDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7; // Last 7 days
    });
    
    if (recentEngagements.length > 0) {
      score += SCORING_WEIGHTS.recency;
    }
    
    // Frequency scoring - bonus for consistent activity
    const uniqueDays = new Set(
      contactEngagements.map(e => new Date(e.timestamp).toDateString())
    ).size;
    
    if (uniqueDays >= 3) {
      score += SCORING_WEIGHTS.frequency;
    }
    
    return Math.round(score);
  },

  async getLeadTemperature(score) {
    await delay(100);
    
    if (score >= TEMPERATURE_THRESHOLDS.hot) return 'hot';
    if (score >= TEMPERATURE_THRESHOLDS.warm) return 'warm';
    return 'cold';
  },

  async getPrioritizedLeads() {
    await delay(400);
    
    try {
      const contacts = await contactService.getAll();
      const scoredLeads = [];
      
      for (const contact of contacts) {
        const score = await this.calculateLeadScore(contact.Id);
        const temperature = await this.getLeadTemperature(score);
        
        scoredLeads.push({
          ...contact,
          score,
          temperature,
          priority: this.calculatePriority(score, temperature)
        });
      }
      
      return scoredLeads.sort((a, b) => b.score - a.score);
    } catch (error) {
      throw new Error('Failed to calculate lead priorities');
    }
  },

  calculatePriority(score, temperature) {
    if (temperature === 'hot') return 1;
    if (temperature === 'warm') return 2;
    return 3;
  },

  async getEngagementSummary(contactId) {
    await delay(200);
    
    const contactEngagements = engagements.filter(e => e.contactId === contactId);
    
    return {
      totalEngagements: contactEngagements.length,
      emailOpens: contactEngagements.filter(e => e.type === 'email_open').length,
      websiteVisits: contactEngagements.filter(e => e.type === 'website_visit').length,
      formSubmissions: contactEngagements.filter(e => e.type === 'form_submission').length,
      lastEngagement: contactEngagements.length > 0 
        ? contactEngagements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0].timestamp
        : null
    };
  },

  async trackEngagement(contactId, type, details = {}) {
    await delay(300);
    
    const newEngagement = {
      Id: Math.max(...engagements.map(e => e.Id)) + 1,
      contactId,
      type,
      timestamp: new Date().toISOString(),
      details,
      source: 'system'
    };
    
    engagements.push(newEngagement);
    return { ...newEngagement };
  },

  async getTopPerformingLeads(limit = 10) {
    await delay(350);
    
    const prioritizedLeads = await this.getPrioritizedLeads();
    return prioritizedLeads.slice(0, limit);
  },

  async getLeadScoreDistribution() {
    await delay(250);
    
    const leads = await this.getPrioritizedLeads();
    
    return {
      hot: leads.filter(l => l.temperature === 'hot').length,
      warm: leads.filter(l => l.temperature === 'warm').length,
      cold: leads.filter(l => l.temperature === 'cold').length,
      averageScore: leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length
    };
  }
};