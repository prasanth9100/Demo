import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getLearnerSummaries from '@salesforce/apex/AgentforceProgressController.getLearnerSummaries';
import getLearnerDetail    from '@salesforce/apex/AgentforceProgressController.getLearnerDetail';

const DAY_TITLES = ['Foundations','Prompt Engineering','Agentforce Concepts','Service & Sales',
  'Data 360','Flows & Apex','Security & Deploy','MCP & Advanced','Cert Review'];
const AVATAR_COLORS = ['#5A4FCF','#B56C0E','#4A3FB0','#0C6E4E','#0F5CA3','#8C3210','#8C2451','#285C10','#4A4A48'];

export default class AgentforceAdminDashboard extends NavigationMixin(LightningElement) {
  @track summaries        = [];
  @track filteredLearners = [];
  @track selectedLearner  = null;
  @track selectedLearnerDays = [];
  @track isLoading        = true;
  @track hasError         = false;
  @track errorMessage     = '';
  @track searchTerm       = '';
  @track activeFilter     = 'All';
  @track sortCol          = 'userName';
  @track sortAsc          = true;
  @track lastRefresh      = '—';

  connectedCallback() { this._load(); }

  _load() {
    this.isLoading = true;
    this.hasError  = false;
    getLearnerSummaries()
      .then(data => {
        this.summaries   = this._processSummaries(data || []);
        this.isLoading   = false;
        this.lastRefresh = new Date().toLocaleTimeString();
        this._applyFilters();
      })
      .catch(err => {
        this.isLoading    = false;
        this.hasError     = true;
        this.errorMessage = err.body?.message || 'Failed to load learner data. Ensure you have admin permissions.';
      });
  }

  refreshData() { this._load(); }

  _processSummaries(raw) {
    return raw.map((r, idx) => {
      const initials = (r.userName || 'U U').split(' ').map(w=>w[0]||'').join('').toUpperCase().slice(0,2);
      return {
        ...r,
        initials,
        avatarStyle: `background:${AVATAR_COLORS[idx % AVATAR_COLORS.length]};`,
        progStyle:   `width:${r.progressPct||0}%;`,
        statusClass: `ad-status ad-status--${(r.status||'').replace(' ','-').toLowerCase()}`,
        avgStarsDisplay: r.avgStars > 0 ? `${r.avgStars} ★` : '—',
        lastActivityFormatted: r.lastActivity ? new Date(r.lastActivity).toLocaleDateString() : '—'
      };
    });
  }

  _applyFilters() {
    let result = [...this.summaries];
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      result = result.filter(l => (l.userName||'').toLowerCase().includes(q) || (l.userEmail||'').toLowerCase().includes(q));
    }
    if (this.activeFilter !== 'All') {
      result = result.filter(l => l.status === this.activeFilter);
    }
    result.sort((a,b) => {
      let av = a[this.sortCol], bv = b[this.sortCol];
      if (typeof av === 'string') av = av.toLowerCase(), bv = (bv||'').toLowerCase();
      if (av < bv) return this.sortAsc ? -1 : 1;
      if (av > bv) return this.sortAsc ? 1 : -1;
      return 0;
    });
    this.filteredLearners = result;
  }

  handleSearch(evt)  { this.searchTerm = evt.target.value||''; this._applyFilters(); }
  handleFilter(evt)  { this.activeFilter = evt.currentTarget.dataset.filter; this._applyFilters(); }
  sortBy(evt)        {
    const col = evt.currentTarget.dataset.col;
    if (this.sortCol === col) this.sortAsc = !this.sortAsc;
    else { this.sortCol = col; this.sortAsc = true; }
    this._applyFilters();
  }

  viewLearnerDetail(evt) {
    const userId = evt.currentTarget.dataset.userid;
    const learner = this.summaries.find(l => l.userId === userId);
    if (!learner) return;
    getLearnerDetail({ userId })
      .then(data => {
        this.selectedLearner = learner;
        this.selectedLearnerDays = this._processDays(data || []);
        this.template.querySelector('.ad-detail-panel')?.scrollIntoView({ behavior:'smooth' });
      })
      .catch(err => { this._showErr(err); });
  }

  _processDays(raw) {
    const byDay = {};
    raw.forEach(r => { byDay[r.DayNumber__c] = r; });
    return Array.from({length:9}, (_,i) => {
      const r    = byDay[i+1];
      const done = r?.IsCompleted__c || false;
      const stars = r?.StarRating__c || 0;
      const take = r?.Takeaways__c   || '';
      const hand = r?.HandsOn__c      || '';
      const ques = r?.Questions__c    || '';
      return {
        dayNum: i+1,
        title:  DAY_TITLES[i],
        isCompleted: done,
        starRating:  stars,
        takeaways:   take,
        handson:     hand,
        questions:   ques,
        hasTakeaways: !!take,
        hasHandson:   !!hand,
        hasQuestions: !!ques,
        hasNotes:     !!(take||hand||ques),
        starsDisplay: stars > 0 ? `${'★'.repeat(stars)}${'☆'.repeat(5-stars)}` : '☆☆☆☆☆',
        statusLabel:  done ? '✅ Done' : (take||hand||ques) ? '📝 Notes' : '⬜ Not Started',
        cardClass:    `ad-day-card ${done?'ad-day-card--done':(take||hand||ques)?'ad-day-card--notes':''}`,
        headerStyle:  `background:${AVATAR_COLORS[i]};`,
        lastSavedFormatted: r?.LastSaved__c ? new Date(r.LastSaved__c).toLocaleDateString() : ''
      };
    });
  }

  closeDetail() { this.selectedLearner = null; this.selectedLearnerDays = []; }

  _showErr(err) {
    this.hasError     = true;
    this.errorMessage = err.body?.message || 'An error occurred.';
  }

  // ── KPI computed ──────────────────────────────────────────────────────────
  get totalLearners()   { return this.summaries.length; }
  get completedLearners(){ return this.summaries.filter(l=>l.status==='Completed').length; }
  get inProgressLearners(){ return this.summaries.filter(l=>l.status==='In Progress').length; }
  get notStartedLearners(){ return this.summaries.filter(l=>l.status==='Not Started').length; }
  get avgProgressPct()  {
    if(!this.summaries.length) return 0;
    return Math.round(this.summaries.reduce((s,l)=>s+(l.progressPct||0),0)/this.summaries.length);
  }
  get avgStars() {
    const rated = this.summaries.filter(l=>l.avgStars>0);
    if(!rated.length) return '—';
    return (rated.reduce((s,l)=>s+parseFloat(l.avgStars),0)/rated.length).toFixed(1);
  }
  get hasLearners()     { return this.filteredLearners.length > 0; }
  get sortIconName()    { return this.sortCol==='userName' ? (this.sortAsc?'↑':'↓') : ''; }

  // ── Filter button classes ─────────────────────────────────────────────────
  get filterAllClass()       { return `ad-filter-btn ${this.activeFilter==='All'?'active':''}`; }
  get filterCompletedClass() { return `ad-filter-btn ${this.activeFilter==='Completed'?'active':''}`; }
  get filterInProgClass()    { return `ad-filter-btn ${this.activeFilter==='In Progress'?'active':''}`; }
  get filterStartedClass()   { return `ad-filter-btn ${this.activeFilter==='Started'?'active':''}`; }
  get filterNotStartClass()  { return `ad-filter-btn ${this.activeFilter==='Not Started'?'active':''}`; }

  // ── Heatmap: completion rate per day ────────────────────────────────────
  get dayHeatmap() {
    if (!this.summaries.length) return [];
    return Array.from({length:9}, (_,i) => {
      // Re-fetch detail per day would need all progress — use summaries proxy
      const pct = 0; // populated after getLearnerDetail calls — placeholder
      return { day:i+1, pct:pct, barStyle:`height:${Math.max(pct,4)}%;background:${AVATAR_COLORS[i]};`, tooltip:`Day ${i+1}: ${pct}% learners completed` };
    });
  }

  // ── CSV Export ────────────────────────────────────────────────────────────
  exportCsv() {
    const headers = ['Name','Email','Days Completed','Progress %','Avg Stars','Status','Last Active'];
    const rows    = this.filteredLearners.map(l => [
      `"${l.userName||''}"`, `"${l.userEmail||''}"`,
      l.completedDays, l.progressPct, l.avgStars||0,
      `"${l.status||''}"`, `"${l.lastActivityFormatted||''}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r=>r.join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], {type:'text/csv'}));
    const a   = document.createElement('a');
    a.href = url; a.download = 'agentforce_progress_' + new Date().toISOString().slice(0,10) + '.csv';
    a.click(); URL.revokeObjectURL(url);
  }
}