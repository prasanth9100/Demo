/**
 * AgentforceProgressController
 * Handles saving and retrieving learner progress for the Agentforce Study Plan LWC.
 * Works for both authenticated internal users and Experience Cloud (LWR) guest/community users.
 */
public with sharing class AgentforceProgressController {

    // ─── Save or upsert a single day's progress ─────────────────────────────
    @AuraEnabled
    public static String saveProgress(
        Integer dayNumber,
        Boolean isCompleted,
        String takeaways,
        String handsOn,
        String questions,
        Integer starRating,
        String activeSection
    ) {
        try {
            Id userId = UserInfo.getUserId();
            String externalKey = userId + '_day' + dayNumber;

            List<AgentforceProgress__c> existing = [
                SELECT Id FROM AgentforceProgress__c
                WHERE ExternalKey__c = :externalKey
                WITH SECURITY_ENFORCED
                LIMIT 1
            ];

            AgentforceProgress__c rec = existing.isEmpty()
                ? new AgentforceProgress__c(ExternalKey__c = externalKey)
                : existing[0];

            rec.UserId__c       = userId;
            rec.UserName__c     = UserInfo.getName();
            rec.UserEmail__c    = UserInfo.getUserEmail();
            rec.DayNumber__c    = dayNumber;
            rec.IsCompleted__c  = isCompleted;
            rec.Takeaways__c    = takeaways;
            rec.HandsOn__c      = handsOn;
            rec.Questions__c    = questions;
            rec.StarRating__c   = starRating;
            rec.ActiveSection__c = activeSection;
            rec.LastSaved__c    = DateTime.now();

            upsert rec ExternalKey__c;
            return 'success';
        } catch (Exception e) {
            throw new AuraHandledException('Save failed: ' + e.getMessage());
        }
    }

    // ─── Load all progress for the current user ──────────────────────────────
    @AuraEnabled(cacheable=true)
    public static List<AgentforceProgress__c> loadMyProgress() {
        try {
            Id userId = UserInfo.getUserId();
            return [
                SELECT DayNumber__c, IsCompleted__c, Takeaways__c, HandsOn__c,
                       Questions__c, StarRating__c, ActiveSection__c, LastSaved__c
                FROM AgentforceProgress__c
                WHERE UserId__c = :userId
                WITH SECURITY_ENFORCED
                ORDER BY DayNumber__c ASC
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Load failed: ' + e.getMessage());
        }
    }

    // ─── Admin: load all learners' progress ─────────────────────────────────
    @AuraEnabled(cacheable=false)
    public static List<AgentforceProgress__c> loadAllProgress() {
        // Requires custom permission or profile check
        if (!FeatureManagement.checkPermission('Agentforce_Admin') &&
            !isAdminUser()) {
            throw new AuraHandledException('Insufficient permissions.');
        }
        return [
            SELECT Id, UserId__c, UserName__c, UserEmail__c,
                   DayNumber__c, IsCompleted__c, StarRating__c,
                   Takeaways__c, HandsOn__c, Questions__c,
                   LastSaved__c, ActiveSection__c
            FROM AgentforceProgress__c
            WITH SECURITY_ENFORCED
            ORDER BY UserName__c ASC, DayNumber__c ASC
        ];
    }

    // ─── Admin: summary stats per learner ───────────────────────────────────
    @AuraEnabled(cacheable=false)
    public static List<LearnerSummary> getLearnerSummaries() {
        if (!isAdminUser() &&
            !FeatureManagement.checkPermission('Agentforce_Admin')) {
            throw new AuraHandledException('Insufficient permissions.');
        }

        List<AgentforceProgress__c> allRecs = [
            SELECT UserId__c, UserName__c, UserEmail__c,
                   DayNumber__c, IsCompleted__c, StarRating__c, LastSaved__c
            FROM AgentforceProgress__c
            WITH SECURITY_ENFORCED
            ORDER BY LastSaved__c DESC
        ];

        Map<String, LearnerSummary> summaryMap = new Map<String, LearnerSummary>();

        for (AgentforceProgress__c r : allRecs) {
            String key = r.UserId__c;
            if (!summaryMap.containsKey(key)) {
                LearnerSummary ls       = new LearnerSummary();
                ls.userId               = r.UserId__c;
                ls.userName             = r.UserName__c;
                ls.userEmail            = r.UserEmail__c;
                ls.completedDays        = 0;
                ls.totalStars           = 0;
                ls.ratedDays            = 0;
                ls.lastActivity         = r.LastSaved__c;
                summaryMap.put(key, ls);
            }
            LearnerSummary ls = summaryMap.get(key);
            if (r.IsCompleted__c)         ls.completedDays++;
            if (r.StarRating__c != null && r.StarRating__c > 0) {
                ls.totalStars  += (Integer)r.StarRating__c;
                ls.ratedDays++;
            }
            if (r.LastSaved__c > ls.lastActivity) ls.lastActivity = r.LastSaved__c;
        }

        for (LearnerSummary ls : summaryMap.values()) {
            ls.progressPct   = (Integer)Math.round((ls.completedDays / 9.0) * 100);
            ls.avgStars      = ls.ratedDays > 0
                ? Decimal.valueOf(ls.totalStars).divide(ls.ratedDays, 1)
                : 0;
            ls.status        = ls.completedDays == 9  ? 'Completed'
                             : ls.completedDays >= 5  ? 'In Progress'
                             : ls.completedDays > 0   ? 'Started'
                             : 'Not Started';
        }

        return summaryMap.values();
    }

    // ─── Admin: detailed progress for one learner ────────────────────────────
    @AuraEnabled(cacheable=false)
    public static List<AgentforceProgress__c> getLearnerDetail(String userId) {
        if (!isAdminUser() &&
            !FeatureManagement.checkPermission('Agentforce_Admin')) {
            throw new AuraHandledException('Insufficient permissions.');
        }
        return [
            SELECT DayNumber__c, IsCompleted__c, StarRating__c,
                   Takeaways__c, HandsOn__c, Questions__c, LastSaved__c
            FROM AgentforceProgress__c
            WHERE UserId__c = :userId
            WITH SECURITY_ENFORCED
            ORDER BY DayNumber__c ASC
        ];
    }

    // ─── Delete a learner's progress record (admin only) ────────────────────
    @AuraEnabled
    public static void deleteProgress(Id recordId) {
        if (!isAdminUser()) throw new AuraHandledException('Insufficient permissions.');
        AgentforceProgress__c rec = [SELECT Id FROM AgentforceProgress__c WHERE Id = :recordId WITH SECURITY_ENFORCED];
        delete rec;
    }

    // ─── Helper ─────────────────────────────────────────────────────────────
    private static Boolean isAdminUser() {
        Profile p = [SELECT Name FROM Profile WHERE Id = :UserInfo.getProfileId() LIMIT 1];
        return p.Name == 'System Administrator' || p.Name == 'Standard User'
            || UserInfo.getUserType() == 'Standard';
    }

    // ─── Inner wrapper class for summary data ───────────────────────────────
    public class LearnerSummary {
        @AuraEnabled public String   userId;
        @AuraEnabled public String   userName;
        @AuraEnabled public String   userEmail;
        @AuraEnabled public Integer  completedDays;
        @AuraEnabled public Integer  progressPct;
        @AuraEnabled public Integer  totalStars;
        @AuraEnabled public Integer  ratedDays;
        @AuraEnabled public Decimal  avgStars;
        @AuraEnabled public String   status;
        @AuraEnabled public DateTime lastActivity;
    }
}